import Link from "next/link";

import type { Analytics } from "@commerce/contracts";

import { PANEL } from "../../../platform/copy";
import { PERIODS, PERIOD_LABELS } from "../../../platform/panel";

/**
 * The four periods, as tabs (I79).
 *
 * §12.1 puts the period in the address, so a reload keeps it and a return from
 * a queue does not lose what was selected. §12.2's four are the whole list —
 * there is no custom range here, because a date picker is the first step
 * towards the report builder `US-PLT-F10-001` AC-18 excludes.
 *
 * The selected one is a `strong` rather than a styled link: it is not
 * navigation, and rendering it as a link to where you already are is the
 * commonest way a tab strip becomes unusable with a keyboard.
 */
export function PeriodTabs({
  base,
  period
}: {
  base: string;
  period: Analytics["period"];
}) {
  return (
    <nav aria-label={PANEL.analyticsPeriod}>
      <ul className="period-tabs">
        {PERIODS.map((entry) => (
          <li key={entry}>
            {entry === period ? (
              <strong>{PERIOD_LABELS[entry]}</strong>
            ) : (
              <Link href={`${base}?period=${entry}`}>
                {PERIOD_LABELS[entry]}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
