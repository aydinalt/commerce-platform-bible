"use client";

import { SUBMIT, submitLabel } from "../../../../../form-copy";

import { useActionState, useState } from "react";

import { CONTENT, PRICING } from "../../../../../business/copy";

import type {
  ApplicableAttribute,
  EditableOfferingContent
} from "@commerce/contracts";

import { PRICING_KINDS, STOCK_STATES } from "@commerce/contracts";

import {
  ACTION_IDLE,
  shortfallMessages,
  type ActionState
} from "../../../../../business/action-outcome";
import {
  CONTENT_LABELS,
  NOT_SPECIFIED,
  currentValue,
  fieldName
} from "../../../../../business/offering-content";

/**
 * One Attribute's input, chosen by the kind its definition declares.
 *
 * The definition decides the control, so a Boolean Attribute cannot be
 * presented as free text and a Single Select cannot be presented as a
 * multiple choice. This is the same fact the API checks the submission
 * against — read once, used twice — rather than a parallel description of it.
 *
 * Every kind offers a way to say nothing, because an Offering holding no value
 * for an Attribute is an ordinary state and not a missing one. Only the
 * publication minimum makes some of them matter, and it says so at publication.
 */
function AttributeField({
  attribute,
  content
}: {
  attribute: ApplicableAttribute;
  content: EditableOfferingContent;
}) {
  const held = currentValue(content, attribute);
  const name = fieldName(attribute.id);
  const label = attribute.unit
    ? `${attribute.name} (${attribute.unit})`
    : attribute.name;

  if (
    attribute.valueKind === "SINGLE_SELECT" ||
    attribute.valueKind === "MULTI_SELECT"
  )
    return (
      <p>
        <label htmlFor={name}>{label}</label>
        <select
          defaultValue={
            attribute.valueKind === "MULTI_SELECT"
              ? (held?.optionIds ?? [])
              : (held?.optionIds[0] ?? "")
          }
          id={name}
          multiple={attribute.valueKind === "MULTI_SELECT"}
          name={name}
        >
          {/* A Single Select needs somewhere to land when the Offering holds
              no value. A Multi Select does not: selecting nothing already
              says it. */}
          {attribute.valueKind === "SINGLE_SELECT" ? (
            <option value="">{NOT_SPECIFIED}</option>
          ) : null}
          {attribute.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </p>
    );

  if (attribute.valueKind === "BOOLEAN")
    return (
      <p>
        <label htmlFor={name}>{label}</label>
        <select defaultValue={held?.text ?? ""} id={name} name={name}>
          <option value="">{NOT_SPECIFIED}</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </p>
    );

  return (
    <p>
      <label htmlFor={name}>{label}</label>
      <input
        defaultValue={held?.text ?? ""}
        id={name}
        name={name}
        step={attribute.valueKind === "NUMBER" ? "any" : undefined}
        type={attribute.valueKind === "NUMBER" ? "number" : "text"}
      />
    </p>
  );
}

/**
 * Price, stock and product key (PRD-0001 v4.0 §5.10, §5.12).
 *
 * The amount fields appear only for a Fixed price. Offering an amount box
 * beside "sorulduğunda belirlenir" would invite a value the contract refuses —
 * `offering_unpriced_carries_no_amount` at the database and
 * `unrecognized_keys` before that — and a form that collects what cannot be
 * saved is a form that lies about what it is for.
 *
 * The controls carry no `required`. §5.10.2 says no Pricing Kind blocks
 * publication, and a required marker here would tell a person the opposite.
 */
function PriceFields({ content }: { content: EditableOfferingContent }) {
  const [kind, setKind] = useState(content.pricing.kind);
  const held = content.pricing.kind === "FIXED" ? content.pricing : null;

  return (
    <fieldset>
      <legend>{PRICING.heading}</legend>

      <p>
        <label htmlFor="pricingKind">{PRICING.kindLabel}</label>
        <select
          defaultValue={content.pricing.kind}
          id="pricingKind"
          name="pricingKind"
          onChange={(event) => {
            setKind(event.target.value as (typeof PRICING_KINDS)[number]);
          }}
        >
          {PRICING_KINDS.map((option) => (
            <option key={option} value={option}>
              {PRICING.kinds[option]}
            </option>
          ))}
        </select>
      </p>

      {kind === "FIXED" ? (
        <>
          <p>
            <label htmlFor="amount">{PRICING.amountLabel}</label>
            <input
              defaultValue={held?.amount ?? ""}
              id="amount"
              inputMode="decimal"
              name="amount"
              type="text"
            />
          </p>
          <p>
            <label htmlFor="currency">{PRICING.currencyLabel}</label>
            <input
              defaultValue={held?.currency ?? PRICING.defaultCurrency}
              id="currency"
              maxLength={3}
              name="currency"
              type="text"
            />
          </p>
          <p>
            <label htmlFor="priorAmount">{PRICING.priorAmountLabel}</label>
            <input
              aria-describedby="prior-amount-hint"
              defaultValue={held?.priorAmount ?? ""}
              id="priorAmount"
              inputMode="decimal"
              name="priorAmount"
              type="text"
            />
            <span className="field-hint" id="prior-amount-hint">
              {PRICING.priorAmountHint}
            </span>
          </p>
          <p>
            <label htmlFor="deliveryCost">{PRICING.deliveryCostLabel}</label>
            <input
              aria-describedby="delivery-cost-hint"
              defaultValue={held?.deliveryCost ?? ""}
              id="deliveryCost"
              inputMode="decimal"
              name="deliveryCost"
              type="text"
            />
            <span className="field-hint" id="delivery-cost-hint">
              {PRICING.deliveryCostHint}
            </span>
          </p>
        </>
      ) : null}

      <p>
        <label htmlFor="stockState">{PRICING.stockLabel}</label>
        <select
          defaultValue={content.pricing.stockState}
          id="stockState"
          name="stockState"
        >
          {STOCK_STATES.map((option) => (
            <option key={option} value={option}>
              {PRICING.stocks[option]}
            </option>
          ))}
        </select>
      </p>

      <p>
        <label htmlFor="productKey">{PRICING.productKeyLabel}</label>
        <input
          aria-describedby="product-key-hint"
          defaultValue={content.productKey ?? ""}
          id="productKey"
          maxLength={64}
          name="productKey"
          type="text"
        />
        <span className="field-hint" id="product-key-hint">
          {PRICING.productKeyHint}
        </span>
      </p>
    </fieldset>
  );
}

/**
 * The Offering content form (UX-0005 §9 Edit).
 *
 * Rendered only where the Dashboard's entries offered `EDIT`, so this
 * component holds no availability rule: a Restricted Business's Published
 * Offering and an Archived one both arrive at this screen without a form, and
 * neither this file nor the page decides that.
 *
 * There is no Publish or Retire button here. Those are actions on the
 * Dashboard, and putting one beside a save would suggest that saving is part
 * of the transition — the opposite of what AC-10 says.
 */
export function ContentForm({
  action,
  content
}: {
  action: (previous: ActionState, form: FormData) => Promise<ActionState>;
  content: EditableOfferingContent;
}) {
  const [state, dispatch, pending] = useActionState(action, ACTION_IDLE);
  const fields = state.kind === "INVALID" ? state.fields : {};

  return (
    <form action={dispatch} noValidate>
      <fieldset disabled={pending}>
        <legend>{CONTENT.heading}</legend>

        <p>
          <label htmlFor="title">{CONTENT_LABELS.title}</label>
          <input
            aria-invalid={fields.title ? true : undefined}
            defaultValue={content.title}
            id="title"
            name="title"
            required
            type="text"
          />
          {fields.title ? (
            <span role="alert">{fields.title.join(" ")}</span>
          ) : null}
        </p>

        <p>
          <label htmlFor="summary">{CONTENT_LABELS.summary}</label>
          <textarea
            aria-invalid={fields.summary ? true : undefined}
            defaultValue={content.summary ?? ""}
            id="summary"
            name="summary"
          />
          {fields.summary ? (
            <span role="alert">{fields.summary.join(" ")}</span>
          ) : null}
        </p>

        <p>
          <label htmlFor="visuals">{CONTENT.visualsLabel}</label>
          <textarea
            aria-describedby="visuals-hint"
            defaultValue={content.visuals.join("\n")}
            id="visuals"
            name="visuals"
          />
          <span className="field-hint" id="visuals-hint">
            {CONTENT.visualsHint}
          </span>
        </p>

        <PriceFields content={content} />

        {content.applicableAttributes.length > 0 ? (
          <fieldset>
            <legend>{CONTENT.attributesHeading}</legend>
            {content.applicableAttributes.map((attribute) => (
              <AttributeField
                attribute={attribute}
                content={content}
                key={attribute.id}
              />
            ))}
          </fieldset>
        ) : null}

        <button type="submit">{submitLabel(SUBMIT.save, pending)}</button>
      </fieldset>

      {/* §15. A refusal says nothing was saved; it never claims a transition,
          and the values above are still the ones the Offering holds. */}
      {state.kind === "REFUSED" ? (
        <div role="alert">
          <p>{state.message}</p>
          {/* The conditions the platform named, relayed rather than composed.
              Absent for every refusal that published none. */}
          {state.shortfalls.length === 0 ? null : (
            <ul>
              {shortfallMessages(state.shortfalls).map((sentence) => (
                <li key={sentence}>{sentence}</li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      {state.kind === "DONE" ? <p role="status">{CONTENT.saved}</p> : null}
    </form>
  );
}
