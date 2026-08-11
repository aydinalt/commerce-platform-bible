import type { PublicOfferingResponse } from "@commerce/contracts";

/**
 * What Discovery handed over (`US-DSC-F09-001` AC-2 and AC-3).
 *
 * This is the identity the person selected, and only that. Complete
 * Presentation — the description, the Attribute values, the public Business
 * identity set, the visual set — belongs to `US-OFR-F05-001` and is not here
 * yet, so this page states what it received rather than dressing it up as
 * something fuller.
 *
 * There is no Compare control, no Decision Chat, no Affiliate Handoff and no
 * Direct Contact. AC-6 forbids opening from starting any of them, and the
 * surest way not to start something is to have no way to.
 */
export function OfferingIdentity({
  offering
}: {
  offering: PublicOfferingResponse;
}) {
  return (
    <main>
      <section>
        <h1>{offering.title}</h1>
        <p className="listing-card-facts">
          <span>{offering.categoryName}</span>
          <span aria-hidden="true">·</span>
          <span>{offering.businessName}</span>
        </p>
      </section>
    </main>
  );
}
