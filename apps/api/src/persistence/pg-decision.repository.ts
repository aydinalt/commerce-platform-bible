import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import {
  EXPIRED_COMPARISON_SETS_SQL,
  EXPIRED_DECISION_FLOWS_SQL
} from "@commerce/database";

import type {
  AffiliateHandoffResponse,
  ComparisonSetResponse,
  ContactChannelsResponse,
  DecisionCompletionsResponse,
  DecisionContextResponse,
  DirectContactRevealResponse,
  ListingCardResponse
} from "@commerce/contracts";
import {
  contextRepairs,
  DECISION_FLOW_TTL_MINUTES,
  DecisionFlowNotFoundError,
  DirectContactUnavailableError,
  HandoffUnavailableError,
  openableInCompare,
  SelectionNotInContextError
} from "@commerce/decision";

/**
 * The Decision Context (`US-DEC-F02-001`).
 *
 * The context is one Offering or one Comparison Set — a CHECK constraint, so
 * nothing here has to keep the two straight. What this file does is answer the
 * harder question the Story actually turns on: whether the context is still
 * *valid*, which is a statement about now rather than about when the person
 * entered.
 */

interface FlowRow {
  comparisonSetId: string | null;
  offeringId: string | null;
  selectedOfferingId: string | null;
}

@Injectable()
export class PgDecisionRepository implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Enters Decision with one eligible Offering (AC-2).
   *
   * No Compare is required and none is created. A person who has read one
   * Offering and wants to act on it has a complete Decision Context.
   */
  async enterWithOffering(
    offeringId: string
  ): Promise<DecisionContextResponse> {
    return this.transact(async (client) => {
      const created = await client.query<{ id: string }>(
        `insert into decision_flow (offering_id, expires_at)
         values ($1, now() + ($2 || ' minutes')::interval)
         returning id`,
        [offeringId, String(DECISION_FLOW_TTL_MINUTES)]
      );
      return this.read(client, this.identifier(created));
    });
  }

  /**
   * Enters Decision with the Comparison Set F01 built (AC-3).
   *
   * The set is referenced, not copied. "Unchanged" is then not a promise this
   * code keeps but a fact about the data: there is only one set, and Decision
   * has no writer for it.
   *
   * **The flow never outlives its set.** `decision_flow.comparison_set_id` is
   * `ON DELETE CASCADE` and the migration says why: a flow pointing at a set
   * that no longer exists would outlive the thing it was about. But both
   * records live sixty minutes from their *own* creation, and a flow is always
   * built on a set that already exists — so the flow always claimed to last
   * longer than the set it depends on. Compare for half an hour, enter
   * Decision, and the flow said sixty minutes while the cascade was going to
   * end it in thirty, in the middle of somebody deciding.
   *
   * `least` makes the claim true rather than making the cascade wrong. The set
   * keeps exactly the sixty minutes `COMPARISON_SET_TTL_MINUTES` gives it, and
   * `DECISION_FLOW_TTL_MINUTES` becomes what it always had to be for this kind
   * of context: a ceiling, not a promise.
   */
  async enterWithComparisonSet(
    comparisonSetId: string
  ): Promise<DecisionContextResponse> {
    return this.transact(async (client) => {
      const created = await client.query<{ id: string }>(
        `insert into decision_flow (comparison_set_id, expires_at)
         select $1, least(now() + ($2 || ' minutes')::interval, c.expires_at)
         from comparison_set c where c.id = $1
         returning id`,
        [comparisonSetId, String(DECISION_FLOW_TTL_MINUTES)]
      );
      // A set that expired between Compare and Decision is simply gone; there
      // is no flow to enter and nothing to reconstruct it from.
      if (created.rowCount === 0) throw new DecisionFlowNotFoundError();
      return this.read(client, this.identifier(created));
    });
  }

  async context(decisionFlowId: string): Promise<DecisionContextResponse> {
    return this.transact(async (client) => this.read(client, decisionFlowId));
  }

  /**
   * Selecting, changing or clearing (`US-DEC-F04-001` AC-2, AC-3, AC-5).
   *
   * One statement for all three, because they are one act: the person says
   * which Offering this flow is about, and `null` says none of them yet.
   * Whether the named Offering belongs to the context is the trigger's
   * question, not this one's.
   *
   * Non-selected members are untouched (AC-4) — nothing here writes to the
   * Comparison Set, and selecting is not a kind of removal.
   */
  async select(
    decisionFlowId: string,
    offeringId: string | null
  ): Promise<DecisionContextResponse> {
    return this.transact(async (client) => {
      try {
        const updated = await client.query(
          `update decision_flow set selected_offering_id = $2 where id = $1`,
          [decisionFlowId, offeringId]
        );
        if (updated.rowCount === 0) throw new DecisionFlowNotFoundError();
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          String(error.message).includes("SELECTION_NOT_IN_CONTEXT")
        )
          throw new SelectionNotInContextError();
        throw error;
      }
      return this.read(client, decisionFlowId);
    });
  }

  private identifier(created: { rows: { id: string }[] }): string {
    const id = created.rows[0]?.id;
    if (!id) throw new Error("DECISION_FLOW_NOT_CREATED");
    return id;
  }

  /**
   * Initiating an Affiliate Handoff (`US-DEC-F05-001`).
   *
   * Both eligibility results are *read*, never worked out. AC-3 forbids
   * recalculating either, and PRD-0001 §7.1 says the same thing more strongly:
   * there is one recorded answer for each, and this query joins them.
   *
   * The read and the record share a transaction, so AC-8 and AC-9 are one
   * statement: either the destination was eligible at this moment and an
   * initiation exists, or it was not and nothing does.
   */
  async initiateHandoff(
    decisionFlowId: string
  ): Promise<AffiliateHandoffResponse> {
    return this.transact(async (client) => {
      const flow = await client.query<{ selectedOfferingId: string | null }>(
        `select selected_offering_id as "selectedOfferingId"
         from decision_flow where id = $1`,
        [decisionFlowId]
      );
      const selectedOfferingId = flow.rows[0]?.selectedOfferingId;
      if (selectedOfferingId === undefined)
        throw new DecisionFlowNotFoundError();
      // AC-5 by way of `US-DEC-F04-001` AC-1: a handoff waits for an explicit
      // selection, and nothing here can supply one on the person's behalf.
      if (selectedOfferingId === null)
        throw new HandoffUnavailableError("NOTHING_SELECTED");

      const eligible = await client.query<{ destination: string }>(
        `select a.reference as destination
         from offering_search_projection p
         join affiliate_destination a on a.offering_id = p.offering_id
         where p.offering_id = $1
           and a.handoff_eligibility = 'ELIGIBLE'`,
        [selectedOfferingId]
      );
      const destination = eligible.rows[0]?.destination;
      if (destination === undefined) {
        // Two conditions, two answers. Which one failed is worth saying: a
        // retired Offering and an unvalidated destination are different
        // problems with different remedies.
        const stillEligible = await client.query(
          `select 1 from offering_search_projection where offering_id = $1`,
          [selectedOfferingId]
        );
        throw new HandoffUnavailableError(
          stillEligible.rowCount === 0
            ? "OFFERING_INELIGIBLE"
            : "DESTINATION_INELIGIBLE"
        );
      }

      // AC-8. One initiation result, carrying the exact address made active.
      const recorded = await client.query<{ initiatedAt: Date }>(
        `insert into affiliate_handoff
           (decision_flow_id, offering_id, destination)
         values ($1, $2, $3) returning initiated_at as "initiatedAt"`,
        [decisionFlowId, selectedOfferingId, destination]
      );
      const initiatedAt = recorded.rows[0]?.initiatedAt;
      if (!initiatedAt) throw new Error("HANDOFF_NOT_RECORDED");

      return {
        destination,
        initiatedAt: initiatedAt.toISOString(),
        offeringId: selectedOfferingId
      };
    });
  }

  /**
   * The two Completions, read from the evidence (`US-DEC-F07-001`).
   *
   * Nothing is written here. AC-3 forbids asking for another confirmation, so
   * Completion is what the initiation and the reveal already mean rather than a
   * second act on top of them — and AC-9 is satisfied the same way: there is no
   * Completion record to be a personal history of.
   *
   * The two are read separately and returned separately (AC-4). A combined
   * answer would lose which end the person actually reached, and PRD-0006
   * counts them apart.
   */
  async completions(
    decisionFlowId: string
  ): Promise<DecisionCompletionsResponse> {
    return this.transact(async (client) => {
      const flow = await client.query(
        `select 1 from decision_flow where id = $1`,
        [decisionFlowId]
      );
      if (flow.rowCount === 0) throw new DecisionFlowNotFoundError();

      // The latest of each, because a person may hand off twice; Completion is
      // a statement about the journey rather than a tally.
      const handoff = await client.query<{
        initiatedAt: Date;
        offeringId: string;
      }>(
        `select initiated_at as "initiatedAt", offering_id as "offeringId"
         from affiliate_handoff where decision_flow_id = $1
         order by initiated_at desc limit 1`,
        [decisionFlowId]
      );
      const contact = await client.query<{
        channel: DirectContactRevealResponse["channel"];
        offeringId: string;
        revealedAt: Date;
      }>(
        `select channel::text as channel, offering_id as "offeringId",
           revealed_at as "revealedAt"
         from direct_contact_reveal where decision_flow_id = $1
         order by revealed_at desc limit 1`,
        [decisionFlowId]
      );

      const initiated = handoff.rows[0];
      const revealed = contact.rows[0];
      return {
        affiliateHandoff: initiated
          ? {
              completedAt: initiated.initiatedAt.toISOString(),
              offeringId: initiated.offeringId
            }
          : null,
        decisionFlowId,
        directContact: revealed
          ? {
              channel: revealed.channel,
              completedAt: revealed.revealedAt.toISOString(),
              offeringId: revealed.offeringId
            }
          : null
      };
    });
  }

  /**
   * Which channels the owning Business supplied (`US-DEC-F06-001` AC-3, AC-5).
   *
   * The names of the channels, never their values. A Guest may be told that a
   * telephone number exists — AC-6 protects the number, not its existence —
   * and the choice AC-5 requires has to be offerable before anything is
   * revealed.
   */
  async contactChannels(
    decisionFlowId: string,
    authenticated: boolean
  ): Promise<ContactChannelsResponse> {
    return this.transact(async (client) => {
      const supplied = await this.channels(client, decisionFlowId);
      return {
        available: supplied.channels,
        // AC-1 and AC-2 in one answer: an Enabled authenticated User, and an
        // Offering that is still eligible now.
        revealable: authenticated && supplied.channels.length > 0
      };
    });
  }

  /**
   * Revealing one explicitly chosen channel (AC-9, AC-10).
   *
   * Every gate is passed before anything is read out, and the read and the
   * record share a transaction — so AC-10 and AC-11 are one statement: either a
   * reveal happened and it is recorded, or nothing was revealed and nothing is.
   *
   * The recorded row holds the channel and not the value. Writing the number
   * down would create a second place the Business's protected information could
   * leak from, and no criterion asks for it.
   */
  async revealContact(input: {
    channel: DirectContactRevealResponse["channel"];
    decisionFlowId: string;
    userId: string;
  }): Promise<DirectContactRevealResponse> {
    return this.transact(async (client) => {
      const supplied = await this.channels(client, input.decisionFlowId);
      const value = supplied.values[input.channel];
      // AC-5. A channel this Business did not supply is refused rather than
      // substituted with one it did.
      if (value === null || value === undefined)
        throw new DirectContactUnavailableError("CHANNEL_NOT_AVAILABLE");

      const recorded = await client.query<{ revealedAt: Date }>(
        `insert into direct_contact_reveal
           (decision_flow_id, offering_id, user_id, channel)
         values ($1, $2, $3, $4::"DirectContactChannel")
         returning revealed_at as "revealedAt"`,
        [input.decisionFlowId, supplied.offeringId, input.userId, input.channel]
      );
      const revealedAt = recorded.rows[0]?.revealedAt;
      if (!revealedAt) throw new Error("REVEAL_NOT_RECORDED");

      return {
        channel: input.channel,
        offeringId: supplied.offeringId,
        revealedAt: revealedAt.toISOString(),
        value
      };
    });
  }

  /**
   * The Selected Offering's owning Business and its supplied channels.
   *
   * Reads through the Discovery projection, so AC-2 is the same question the
   * rest of the system asks: an Offering that stopped being eligible is not
   * there, and Direct Contact stops with it.
   */
  private async channels(
    client: PoolClient,
    decisionFlowId: string
  ): Promise<{
    channels: DirectContactRevealResponse["channel"][];
    offeringId: string;
    values: Record<string, string | null>;
  }> {
    const flow = await client.query<{ selectedOfferingId: string | null }>(
      `select selected_offering_id as "selectedOfferingId"
       from decision_flow where id = $1`,
      [decisionFlowId]
    );
    const selectedOfferingId = flow.rows[0]?.selectedOfferingId;
    if (selectedOfferingId === undefined) throw new DecisionFlowNotFoundError();
    if (selectedOfferingId === null)
      throw new DirectContactUnavailableError("NOTHING_SELECTED");

    const found = await client.query<{
      contactEmail: string | null;
      contactTelephone: string | null;
      contactUrl: string | null;
    }>(
      `select b.contact_telephone as "contactTelephone",
         b.contact_email as "contactEmail", b.contact_url as "contactUrl"
       from offering_search_projection p
       join business b on b.id = p.business_id
       where p.offering_id = $1`,
      [selectedOfferingId]
    );
    const business = found.rows[0];
    if (!business)
      throw new DirectContactUnavailableError("OFFERING_INELIGIBLE");

    const values = {
      EMAIL: business.contactEmail,
      TELEPHONE: business.contactTelephone,
      URL: business.contactUrl
    };
    const channels = (
      ["TELEPHONE", "EMAIL", "URL"] as DirectContactRevealResponse["channel"][]
    ).filter((channel) => values[channel] !== null);
    // AC-3. A Business with no supplied channel cannot be contacted by anyone,
    // which is a state of the Business rather than a failure of the request.
    if (channels.length === 0)
      throw new DirectContactUnavailableError("NO_CHANNEL");

    return { channels, offeringId: selectedOfferingId, values };
  }

  private async transact<T>(work: (client: PoolClient) => Promise<T>) {
    const client = await this.pool.connect();
    try {
      // Expired flows and sets are swept together, so a flow can never be read
      // while the set it points at has already gone. Outside the transaction:
      // the refusal that follows reading an expired flow would otherwise roll
      // the sweep back.
      await client.query(EXPIRED_DECISION_FLOWS_SQL);
      await client.query(EXPIRED_COMPARISON_SETS_SQL);
      await client.query("begin");
      const result = await work(client);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * The context, with its validity decided now.
   *
   * Both halves are read through the Discovery projection, which is the single
   * eligibility answer the rest of the system uses. An Offering retired since
   * the person entered therefore reports itself invalid rather than quietly
   * continuing to look fine — AC-8's point is that Chat must not go on to
   * describe it.
   */
  private async read(
    client: PoolClient,
    decisionFlowId: string
  ): Promise<DecisionContextResponse> {
    const found = await client.query<FlowRow>(
      `select offering_id as "offeringId",
         comparison_set_id as "comparisonSetId",
         selected_offering_id as "selectedOfferingId"
       from decision_flow where id = $1`,
      [decisionFlowId]
    );
    const flow = found.rows[0];
    if (!flow) throw new DecisionFlowNotFoundError();

    const offering =
      flow.offeringId === null
        ? null
        : await this.offering(client, flow.offeringId);
    const comparison =
      flow.comparisonSetId === null
        ? null
        : await this.comparison(client, flow.comparisonSetId);

    // AC-7. One statement of validity for two shapes of context, because the
    // things it gates — Chat, and every handoff action — do not care which
    // kind of context they were denied.
    const valid =
      flow.offeringId === null
        ? comparison !== null && comparison.openable
        : offering !== null;

    // AC-6's other half, read rather than written: a selection whose Offering
    // stopped being eligible resolves to nothing here, so it cannot be acted
    // on even though the column still holds an identifier. The removal case is
    // cleared by the database; this one cannot be, because nobody touched the
    // set — the world changed underneath it.
    const selected =
      flow.selectedOfferingId === null
        ? null
        : await this.offering(client, flow.selectedOfferingId);

    const handoffAvailable = valid && selected !== null;

    return {
      /*
       * `US-DEC-F05-001` AC-1, answered before the person acts rather than
       * only when they do.
       *
       * The same join the initiation performs, asked as a question instead of
       * as a change — so a path this read offers is one that read would
       * honour, and a path it withholds is one that would have been refused.
       * The address itself stays inside the initiation: this says whether, not
       * where.
       */
      affiliateAvailable:
        handoffAvailable &&
        (
          await client.query(
            `select 1
             from offering_search_projection p
             join affiliate_destination a on a.offering_id = p.offering_id
             where p.offering_id = $1 and a.handoff_eligibility = 'ELIGIBLE'`,
            [flow.selectedOfferingId]
          )
        ).rowCount === 1,
      comparison,
      decisionFlowId,
      // AC-7. One answer for both handoffs, and it needs a valid context *and*
      // a current eligible selection — a valid context with nothing chosen
      // offers nothing.
      handoffAvailable,
      invalidity: valid
        ? null
        : flow.offeringId === null
          ? "SET_NOT_VALID"
          : "OFFERING_INELIGIBLE",
      offering,
      repairs: valid
        ? []
        : contextRepairs({ hasComparisonSet: flow.comparisonSetId !== null }),
      selected,
      /*
       * UX-0009 §16. The column still holds an identifier and the Offering no
       * longer resolves — which is exactly "something was chosen and has
       * stopped being eligible", and is a different state from never having
       * chosen. Both were already known here; only one of them was published.
       *
       * The removal case is cleared by the database, so it does not reach
       * this: a member removed from a Comparison Set leaves the column null
       * and the person sees the ordinary prompt to choose again.
       */
      selectionLost: flow.selectedOfferingId !== null && selected === null,
      valid
    };
  }

  /**
   * The single Offering, or nothing.
   *
   * `null` is the whole of AC-8 for this shape: an ineligible Offering is not
   * returned in a diminished form that Chat could still quote, it is not
   * returned at all.
   */
  private async offering(
    client: PoolClient,
    offeringId: string
  ): Promise<ListingCardResponse | null> {
    const result = await client.query<
      Omit<ListingCardResponse, "publishedAt"> & { publishedAt: Date }
    >(
      `select p.offering_id as "offeringId", p.title,
         p.business_name as "businessName", c.name as "categoryName",
         o.slug, p.published_at as "publishedAt"
       from offering_search_projection p
       join offering o on o.id = p.offering_id
       join category c on c.id = p.category_id
       where p.offering_id = $1`,
      [offeringId]
    );
    const row = result.rows[0];
    return row ? { ...row, publishedAt: row.publishedAt.toISOString() } : null;
  }

  /**
   * The Comparison Set as it stands, read rather than copied.
   *
   * Members come through the projection, so one retired since Compare stops
   * being a member here too — which is how a set can fall below two while
   * nobody touched it.
   */
  private async comparison(
    client: PoolClient,
    comparisonSetId: string
  ): Promise<ComparisonSetResponse | null> {
    const set = await client.query<{
      categoryId: string;
      categoryName: string;
    }>(
      `select s.category_id as "categoryId", c.name as "categoryName"
       from comparison_set s join category c on c.id = s.category_id
       where s.id = $1`,
      [comparisonSetId]
    );
    const header = set.rows[0];
    if (!header) return null;

    const members = await client.query<
      Omit<ListingCardResponse, "publishedAt"> & { publishedAt: Date }
    >(
      `select p.offering_id as "offeringId", p.title,
         p.business_name as "businessName", c.name as "categoryName",
         o.slug, p.published_at as "publishedAt"
       from comparison_set_member m
       join offering_search_projection p on p.offering_id = m.offering_id
       join offering o on o.id = m.offering_id
       join category c on c.id = p.category_id
       where m.comparison_set_id = $1
       order by m.added_at, m.offering_id`,
      [comparisonSetId]
    );

    return {
      categoryId: header.categoryId,
      categoryName: header.categoryName,
      comparisonSetId,
      full: members.rows.length >= 5,
      members: members.rows.map((row) => ({
        ...row,
        publishedAt: row.publishedAt.toISOString()
      })),
      openable: openableInCompare(members.rows.length)
    };
  }
}
