import { SearchExperience } from "@/components/SearchExperience";

export const metadata = {
  description:
    "Ürünleri fiyat, taksit ve teknik özelliklerine göre karşılaştırın.",
  title: "Ürün karşılaştırma"
};

/**
 * The search and results route.
 *
 * A server component whose only job is to render one client component. The
 * boundary is drawn here rather than deeper because everything below it reacts
 * to the same filter state, and a boundary in the middle of that would mean
 * serialising the state across it on every keystroke.
 */
export default function Page() {
  return <SearchExperience />;
}
