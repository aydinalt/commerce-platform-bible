import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { ProductDetail } from "@/components/product/ProductDetail";
import { SearchExperience } from "@/components/SearchExperience";
import { PRODUCTS, productBySlug } from "@/lib/products";

/**
 * The preview harness.
 *
 * **It renders the real components.** Nothing here re-implements a screen —
 * `SearchExperience` and `ProductDetail` are the same files the Next
 * application imports, so what a person judges in the preview is the product
 * rather than a drawing of it. Only two things are replaced: Next's router,
 * by the hash routing below, and `next/link`, by a shim esbuild aliases in.
 *
 * The cost is honest and small: server components run in the browser here, so
 * anything that reached for a request or a cookie would fail — and neither of
 * these screens does.
 */

function useHashRoute(): string {
  const [route, setRoute] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.hash.slice(1) || "/"
  );
  useEffect(() => {
    const read = () => {
      setRoute(window.location.hash.slice(1) || "/");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return route;
}

/** Fixed at twelve, exactly as the route does, and it is the same known gap. */
const MONTHS = 12;

function Preview() {
  const route = useHashRoute();
  const slug = route.startsWith("/urun/") ? route.slice("/urun/".length) : null;

  if (slug === null) return <SearchExperience />;

  const product = productBySlug(slug);
  if (product === undefined)
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Ürün bulunamadı</h1>
        <p className="mt-2 text-slate-600">
          Aradığınız ürün burada değil.{" "}
          <a className="font-medium text-sky-800 underline" href="#/">
            Tüm ürünlere dönün
          </a>
          .
        </p>
      </div>
    );

  return (
    <ProductDetail months={MONTHS} product={product} products={PRODUCTS} />
  );
}

const host = document.getElementById("root");
if (host !== null)
  createRoot(host).render(
    <StrictMode>
      <Preview />
    </StrictMode>
  );
