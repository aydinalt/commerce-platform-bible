import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { fetchAdminPanel, fetchCategories } from "../../../platform/api";
import {
  DOMAIN_LABELS,
  NO_CATEGORIES,
  asTree
} from "../../../platform/catalog";
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

  const panel = await fetchAdminPanel(session);
  if (panel === null) notFound();

  const categories = await fetchCategories(session);

  return (
    <main>
      <p>
        <Link href="/admin">Platform administration</Link>
      </p>
      <h1>Categories</h1>

      {categories === null ? (
        <p role="alert">The catalogue could not be loaded.</p>
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
                    {DOMAIN_LABELS[category.domain]} · {category.stableKey}
                  </p>

                  {category.active ? (
                    <>
                      <RenameCategory
                        action={renameCategory.bind(null, category.id)}
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

          <CreateCategory action={createCategory} categories={categories} />
        </>
      )}
    </main>
  );
}
