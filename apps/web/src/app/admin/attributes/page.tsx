import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../unavailable";

import {
  fetchAdminPanel,
  fetchAttributes,
  fetchCategories
} from "../../../platform/api";
import { NO_ATTRIBUTES, VALUE_KIND_LABELS } from "../../../platform/catalog";
import { ATTRIBUTES, PANEL } from "../../../platform/copy";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";
import {
  addAttributeOption,
  createAttribute,
  retireAttributeOption,
  setAttributeCategories,
  setAttributeRequired,
  updateAttributeProperties
} from "./actions";
import {
  AddOption,
  AttributeCategories,
  AttributeProperties,
  CreateAttribute,
  RequiredForPublication,
  RetireOption
} from "./attribute-forms";

import type { Metadata } from "next";

export const metadata: Metadata = { title: ATTRIBUTES.title };

/**
 * Attribute management (UX-0006 §11).
 *
 * §11 lists six ways a change could silently alter or delete what Offerings
 * already say, and asks the experience to prevent or explain each. Every one
 * is refused by `US-PLT-F09-001` inside the transaction that would have made
 * it — so this page explains, and holds none of the rules.
 *
 * The value kind has no control after creation. Its route exists and refuses
 * while active-lifecycle Offerings hold values; offering it here would mean
 * offering a change that is almost always refused, which teaches an Admin to
 * expect refusals rather than to understand them. Changing the kind of a
 * definition nothing depends on is possible through the API, and that is where
 * it belongs until there is a screen that can say when it would work.
 */
export default async function AttributesPage() {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const panel = await orUnavailable(fetchAdminPanel(session));
  /*
   * Two answers where there was one. `notFound()` answered both, so during an
   * outage every Admin route said the Admin panel does not exist — the same claim the
   * API deliberately makes to somebody who is not an Admin, which is exactly
   * why it must not also be made to somebody who is.
   */
  if (isUnavailable(panel))
    return <ServiceUnavailable retryPath="/admin/attributes" />;
  if (panel === null) notFound();

  const [readAttributes, readCategories] = await Promise.all([
    orUnavailable(fetchAttributes(session)),
    orUnavailable(fetchCategories(session))
  ]);
  // Both land on the one message below, which says the catalogue could not be
  // loaded and nothing about what is in it.
  const attributes = isUnavailable(readAttributes) ? null : readAttributes;
  /*
   * The catalogue read now carries the Domains beside the Categories, because
   * the create-root form needs them (PRD-0001 v4.0 §E). This screen wants only
   * the Categories — an Attribute is made applicable to Categories, never to a
   * Domain — so it takes that half and leaves the other alone.
   */
  const catalogue = isUnavailable(readCategories) ? null : readCategories;
  const categories = catalogue?.categories ?? null;

  if (attributes === null || categories === null)
    return (
      <main>
        <h1>{ATTRIBUTES.title}</h1>
        <p role="alert">{ATTRIBUTES.unreadable}</p>
      </main>
    );

  return (
    <main>
      <p>
        <Link href="/admin">{PANEL.title}</Link>
      </p>
      <h1>{ATTRIBUTES.title}</h1>

      {attributes.length === 0 ? (
        <p>{NO_ATTRIBUTES}</p>
      ) : (
        <ul>
          {attributes.map((attribute) => (
            <li key={attribute.id}>
              <h2>
                {attribute.name}{" "}
                {attribute.active ? null : <span>(retired)</span>}
              </h2>
              <p>
                {VALUE_KIND_LABELS[attribute.valueKind]} · {attribute.stableKey}
              </p>

              <AttributeProperties
                action={updateAttributeProperties.bind(null, attribute.id)}
                attribute={attribute}
              />
              <RequiredForPublication
                action={setAttributeRequired.bind(null, attribute.id)}
                attribute={attribute}
              />
              <AttributeCategories
                action={setAttributeCategories.bind(null, attribute.id)}
                attribute={attribute}
                categories={categories}
              />

              {/* Allowed values, with retired ones still listed. A retired
                  value stays on the Offerings that already hold it, so hiding
                  it here would hide the explanation for a value an Admin can
                  see elsewhere. */}
              {attribute.options.length === 0 ? null : (
                <ul>
                  {attribute.options.map((option) => (
                    <li key={option.id}>
                      {option.label}
                      {option.active ? (
                        <RetireOption
                          action={retireAttributeOption.bind(
                            null,
                            attribute.id,
                            option.id
                          )}
                          label={option.label}
                        />
                      ) : (
                        <span> (retired)</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <AddOption action={addAttributeOption.bind(null, attribute.id)} />
            </li>
          ))}
        </ul>
      )}

      <CreateAttribute action={createAttribute} categories={categories} />
    </main>
  );
}
