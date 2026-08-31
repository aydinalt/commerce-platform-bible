import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../unavailable";

import { fetchAdminPanel, fetchCategories } from "../../../platform/api";
import { NO_CATEGORIES, asTree } from "../../../platform/catalog";
import { CATEGORIES, PANEL } from "../../../platform/copy";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";
import {
  createCategory,
  renameCategory,
  reparentCategory,
  retireCategory
} from "./actions";
import {
  CreateCategory,
  RenameCategory,
  ReparentCategory,
  RetireCategory
} from "./category-forms";

import type { Metadata } from "next";

export const metadata: Metadata = { title: CATEGORIES.title };

/**
 * Category and Domain management (UX-0006 §10).
 *
 * Everything §10 asks the experience to prevent is prevented by the platform,
 * and this page's job is the other half: to explain. A self-ancestor cycle, a
 * cross-Domain move, a retirement with an active child or a live Offering
 * still assigned — each is refused in the service or the database, and each
 * refusal arrives here as a sentence saying what survived.
 *
 * The tree is rendered as a tree because the hierarchy is the thing being
 * managed. A flat list of names could not show that one Category sits inside
 * another, which is exactly the relationship an Admin is here to change.
 */
export default async function CategoriesPage() {
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
    return <ServiceUnavailable retryPath="/admin/categories" />;
  if (panel === null) notFound();

  // `null` and unavailable arrive at the same message here, which was already
  // honest: "the catalogue could not be loaded" is true of both and claims
  // nothing about what the catalogue contains.
  const read = await orUnavailable(fetchCategories(session));
  const catalogue = isUnavailable(read) ? null : read;
  const categories = catalogue?.categories ?? null;
  const domains = catalogue?.domains ?? [];

  return (
    <main>
      <p>
        <Link href="/admin">{PANEL.title}</Link>
      </p>
      <h1>{CATEGORIES.title}</h1>

      {categories === null ? (
        <p role="alert">{CATEGORIES.unreadable}</p>
      ) : (
        <>
          {categories.length === 0 ? (
            <p>{NO_CATEGORIES}</p>
          ) : (
            <ul>
              {asTree(categories).map(({ category, depth }) => (
                <li key={category.id} style={{ marginLeft: `${depth}rem` }}>
                  <h2>
                    {category.name}{" "}
                    {/* Retired is stated rather than implied by absence: the
                        definition survives, and an Admin needs to see that it
                        is still there and no longer taking anything new. */}
                    {category.active ? null : <span>(retired)</span>}
                  </h2>
                  <p>
                    {category.domainName} · {category.stableKey}
                  </p>

                  {category.active ? (
                    <>
                      <RenameCategory
                        action={renameCategory.bind(null, category.id)}
                        categoryId={category.id}
                        name={category.name}
                      />
                      <ReparentCategory
                        action={reparentCategory.bind(null, category.id)}
                        categories={categories}
                        category={category}
                      />
                      <RetireCategory
                        action={retireCategory.bind(null, category.id)}
                      />
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <CreateCategory
            action={createCategory}
            categories={categories}
            domains={domains}
          />
        </>
      )}
    </main>
  );
}
