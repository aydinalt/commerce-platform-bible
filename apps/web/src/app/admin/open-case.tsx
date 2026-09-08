"use client";

import { useActionState, useRef } from "react";

import { CASES } from "../../platform/copy";
import { ADMIN_IDLE, type AdminActionState } from "../../platform/admin-state";

/**
 * "Open a Moderation Case" — beside the target, not on a page of its own (I82).
 *
 * The Owner's instruction: *"Ayrı, yepyeni bir 'Vaka Oluşturma' sayfası
 * tasarlamana gerek yok… hedefin hemen yanına bir eylem butonu ekle… Modal
 * hedef kimliğini otomatik olarak içine alsın."*
 *
 * That is the right shape for a reason worth writing down: **nobody types an
 * identifier.** `POST /admin/moderation-cases` takes a UUID, and a form that
 * asked an Admin for one would be a form they can get wrong — against the wrong
 * listing, or against nothing. The target is whatever they were already looking
 * at, so the only decision left is whether to open a case at all.
 *
 * **The dialog is a `<dialog>`, not a div with a class.** It gets focus
 * trapping, `Esc`, the backdrop and the accessible role from the platform
 * rather than from a hundred lines here that would be subtly worse — and an
 * Admin who opens this by mistake gets out with the key they already expect.
 *
 * **It confirms and does not configure.** There are no fields: no reason, no
 * severity, no note. A case is opened and then worked, and the seven actions
 * plus the no-action decision are where the judgement is recorded — a reason
 * captured here would be a second, unreviewed place that judgement lives.
 *
 * Pressing it twice is safe. A target with an Open case answers with that case
 * rather than a second one (AC-2), so a double press lands on the same place.
 */
export function OpenCase({
  label,
  open,
  targetName
}: {
  /** What the control says. Composed by the caller from the target's kind. */
  label: string;
  open: (previous: AdminActionState) => Promise<AdminActionState>;
  targetName: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, act, pending] = useActionState(open, ADMIN_IDLE);

  return (
    <>
      <button onClick={() => dialog.current?.showModal()} type="button">
        {label}
      </button>

      <dialog ref={dialog}>
        <h2>{label}</h2>
        {/* The target, named back to the Admin. The whole safety of a control
            that carries an id it never shows is that the person can see which
            thing they are about to act on. */}
        <p>{CASES.openAgainst(targetName)}</p>
        <p>{CASES.openNote}</p>

        {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}

        <form action={act}>
          <button disabled={pending} type="submit">
            {pending ? CASES.working : CASES.openConfirm}
          </button>
        </form>
        {/* `formmethod="dialog"` inside the action form would submit it; a
            separate button keeps cancelling from doing anything at all. */}
        <form method="dialog">
          <button type="submit">{CASES.openCancel}</button>
        </form>
      </dialog>
    </>
  );
}
