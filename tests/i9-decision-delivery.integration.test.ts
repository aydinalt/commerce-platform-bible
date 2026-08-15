import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { decisionChatSchema } from "@commerce/contracts";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";
const PASSWORD = "correct horse battery staple";

class RecordingDispatcher implements EmailDispatcher {
  readonly delivered: EmailMessage[] = [];

  deliver(message: EmailMessage): Promise<void> {
    this.delivered.push(message);
    return Promise.resolve();
  }
}

/**
 * The one Decision criterion nothing yet asserted.
 *
 * `US-DEC-F03-001` AC-5 names five things Decision Chat shall permit the
 * explanation of. Four are covered by `i5-decision-chat`: Offering information,
 * authoritative values, `Not provided`, and person-stated priorities. The fifth
 * — **comparable Attribute differences** — is not, and the reason is structural
 * rather than an oversight: every existing Chat test enters a flow with one
 * Offering, and a difference needs two.
 *
 * A difference is also the criterion most easily satisfied dishonestly. AC-6
 * forbids a ranking, a winner and a recommendation, so the only truthful way to
 * explain a difference is to put both authoritative values where a person can
 * see them and say nothing about which is better.
 */
suite("Increment I9 Decision delivery evidence", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let leafId: string;
  let mileageId: string;

  const address = () => `dc-${randomUUID()}@example.test`;
  const key = () => `K${randomUUID().replaceAll("-", "").toUpperCase()}`;
  const slug = () => `s-${randomUUID()}`;

  const send = (
    method: "GET" | "POST" | "PUT",
    url: string,
    options: { body?: unknown; cookie?: string } = {}
  ) =>
    app.inject({
      ...(options.body === undefined ? {} : { body: options.body }),
      headers: {
        origin: ORIGIN,
        ...(options.cookie === undefined ? {} : { cookie: options.cookie })
      },
      method,
      url: `/api/v1${url}`
    });

  const signUp = async () => {
    const email = address();
    await send("POST", "/auth/registrations", {
      body: { email, password: PASSWORD }
    });
    await processor.processBatch();
    const message = dispatcher.delivered.find((m) => m.recipient === email);
    const link = /https?:\/\/\S+/u.exec(message?.body ?? "")?.[0] ?? "";
    const confirmed = await send("POST", "/auth/registrations/confirmations", {
      body: { token: new URL(link).searchParams.get("token") }
    });
    const cookies = confirmed.cookies as { name: string; value: string }[];
    return {
      cookie: `commerce_session=${cookies.find((c) => c.name === "commerce_session")?.value ?? ""}`,
      userId: confirmed.json<{ userId: string }>().userId
    };
  };

  /** A publicly eligible Offering in the shared leaf, with an optional mileage. */
  const publish = async (title: string, mileage: number | null) => {
    const account = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    const businessId = business.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId: leafId, slug: slug(), title },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: {
          attributes:
            mileage === null
              ? []
              : [{ attributeId: mileageId, kind: "NUMBER", number: mileage }],
          categoryId: leafId,
          title
        },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return offeringId;
  };

  /** A Decision flow entered from a two-member Comparison Set. */
  const flowFromSet = async (first: string, second: string) => {
    const created = await send("POST", "/decision/comparison-sets", {
      body: { offeringId: first }
    });
    const comparisonSetId = created.json<{ comparisonSetId: string }>()
      .comparisonSetId;
    await send("POST", `/decision/comparison-sets/${comparisonSetId}/members`, {
      body: { offeringId: second }
    });
    const entered = await send("POST", "/decision/flows", {
      body: { comparisonSetId }
    });
    return entered.json<{ decisionFlowId: string }>().decisionFlowId;
  };

  const ask = (
    decisionFlowId: string,
    question: string,
    priorities?: string[]
  ) =>
    send("POST", `/decision/flows/${decisionFlowId}/chat`, {
      body: { priorities: priorities ?? [], question }
    });

  beforeAll(async () => {
    process.env.ENABLE_TEST_PRINCIPAL = "false";
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, publicWebUrl: ORIGIN });

    admin = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [admin.userId]
    );
    await send("PUT", "/auth/me/admin-context", { cookie: admin.cookie });
    const root = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Araçlar",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    const leaf = await send("POST", "/admin/categories", {
      body: {
        name: "Otomobil",
        parentId: root.json<{ id: string }>().id,
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    leafId = leaf.json<{ id: string }>().id;
    const mileage = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [leafId],
        comparable: true,
        filterable: true,
        name: "Kilometre",
        options: [],
        stableKey: key(),
        unit: "km",
        valueKind: "NUMBER"
      },
      cookie: admin.cookie
    });
    mileageId = mileage.json<{ id: string }>().id;
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await processor.close();
    await pool.end();
  });

  it("puts both members' comparable values where the difference is visible", async () => {
    const near = await publish("Kırmızı araba", 42000);
    const far = await publish("Mavi araba", 130000);
    const decisionFlowId = await flowFromSet(near, far);

    const answered = await ask(decisionFlowId, "Kilometreleri nedir?");
    const reply =
      decisionChatSchema.parse(answered.json()).turns[0]?.reply ?? "";

    // `US-DEC-F03-001` AC-5, the half about comparable Attribute differences.
    // Both authoritative values are in the reply with their governed unit, and
    // both titles are there to say which belongs to which. That is the whole of
    // what a difference is: two values a person can hold side by side.
    expect(reply).toContain("42000");
    expect(reply).toContain("130000");
    expect(reply).toContain("km");
    expect(reply).toContain("Kırmızı araba");
    expect(reply).toContain("Mavi araba");
  });

  it("explains the difference without saying which is better", async () => {
    const near = await publish("Kırmızı araba", 42000);
    const far = await publish("Mavi araba", 130000);
    const decisionFlowId = await flowFromSet(near, far);

    const answered = await ask(decisionFlowId, "Hangisini almalıyım?", [
      "düşük kilometre"
    ]);
    const reply =
      decisionChatSchema.parse(answered.json()).turns[0]?.reply ?? "";

    // AC-6 is the reason AC-5 is delicate. Asked outright which to buy, and
    // handed a priority that points at one of them, the reply still reports and
    // does not conclude: the stated priority comes back as something the person
    // said, and no comparative or superlative appears anywhere.
    //
    // Asserted against the vocabulary rather than against a sentence, because a
    // recommendation can be phrased many ways and all of them need these words.
    expect(reply).toContain("düşük kilometre");
    expect(reply).not.toMatch(
      /öneri|tavsiye|daha iyi|en iyi|uygun görün|tercih ed|kazan/iu
    );
  });

  it("carries only what the current context contains", async () => {
    const inside = await publish("Kırmızı araba", 42000);
    const outside = await publish("Yeşil araba", 7000);
    const second = await publish("Mavi araba", 130000);
    const decisionFlowId = await flowFromSet(inside, second);

    const answered = await ask(decisionFlowId, "Kilometreleri nedir?");
    const reply =
      decisionChatSchema.parse(answered.json()).turns[0]?.reply ?? "";

    // AC-4. A comparison is exactly as trustworthy as its boundary: an Offering
    // that exists, is eligible, and shares the leaf Category is still not part
    // of *this* context, and its figure must not appear beside the two that
    // are.
    expect(outside).not.toBe(inside);
    expect(reply).not.toContain("Yeşil araba");
    expect(reply).not.toContain("7000");
  });
});
