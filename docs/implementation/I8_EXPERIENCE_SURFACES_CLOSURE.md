# I8 Experience Surfaces — Closure Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-14 (amended after the recorded gaps were closed)
- **Scope:** Implementation record only. No Frozen Story is edited and no Delivery Status changes.

## What this increment delivered

I1 through I7 built everything the platform can do. I8 builds every place a
person can ask it to.

Thirteen commits, twenty-two routes and thirteen test files, ending on 722
tests. UX-0001 through UX-0009 now all have surfaces. This closes the last body
of Frozen work that was not a Story.

The organizing idea, stated once and applied everywhere: **a screen offers what
the write path would honour, because both read the same answer.** No page in
this increment holds an availability rule. Where one seemed to be needed, the
answer was to make the API say it — twice, recorded below — rather than to let a
second opinion grow in the browser.

## Per-document coverage

| Document | State | Notes |
|---|---|---|
| UX-0008 Authentication | Covered | Registration, confirmation, login, recovery, reset, the three context entries, logout. One identical refusal for wrong password, unknown address and Suspended |
| UX-0005 Business Dashboard | Covered | Inventory by lifecycle, Business Information, Offering actions, the Offering edit screen, correction notices, the bounded correction path, Affiliate Destination management |
| UX-0009 Decision Flow | Covered | Context, Chat, explicit selection, handoff choice, Affiliate handoff, Direct Contact, the two Completions |
| UX-0006 Admin Dashboard | Covered | Panel entry, overview, Basic Analytics, moderation cases and all seven actions, destination workload, Category and Attribute management |
| UX-0001 Home, UX-0002 Discovery, UX-0003 Offering, UX-0004 Compare | Covered in I4/I5 | Closed in `I4_PUBLIC_WEB_JOURNEY_CLOSURE.md` and `I5_COMPARE_AND_DECISION_CLOSURE.md`; I8 only wired their Decision entries to a live flow |
| UX-0007 Messaging | Out of scope | There is no Messaging in V1. The Decision flow and the correction notices each state an absence where a message box would otherwise be invented |

## Product decisions taken during delivery

| Decision | Reasoning |
|---|---|
| Public journey in Turkish, entered contexts in English | The Owner's decision. Discovery, the Offering Presentation, Compare and Decision are one continuous journey and `html lang` is `tr`; changing language mid-journey reads as having left the platform. Authentication, the Business Dashboard and Admin are rooms you sign in to work in |
| The owner's Offering read carries the Category's applicable Attributes | A form's fields and the definitions governing them must be answered at one instant against one Category. Two reads would let a Category change between them and produce a form offering inputs the write path then refuses |
| The Decision Context carries `affiliateAvailable` | §9 offers only the paths currently available, and the context could not say whether the Selected Offering's destination was eligible. It is answered by the same conjunction the initiation enforces, so an offered path is one the platform would honour |
| The Affiliate destination appears in no read | §16 keeps an unavailable path from exposing where it would have led, which only holds if the available path does not expose it either. So Affiliate is a submission rather than a link, and the address is read inside the initiation |
| The authentication return names a destination, not a URL | `returnPath` maps a name through a closed list. An open redirect is not defended against — it is unspeakable. What was selected and which action was interrupted already live in the flow on the server |
| The revealed contact value is carried by the action, not re-read | `US-DEC-F06-001` records the channel and not the information, keeping it in one place. Making it re-readable would create a second place it could leak from |
| Every refusal sentence says what survived | A person meeting a refusal needs to know the state they are in, not only that they failed. Where the same code means different things at different moments, it gets a second vocabulary rather than one sentence true of neither |
| `EDIT_REFUSALS`, `CORRECTION_REFUSALS` and `CATALOG_REFUSALS` are separate maps | `PUBLICATION_MINIMUM_NOT_SATISFIED` means "not ready yet" at publication and "your change was not applied" at a save. One wording covering both would be true of neither |
| Consequences are stated before the action, not after | Saving a destination reference returns it to Draft and Not Validated; making an Attribute required asks something of every live Offering; closing a case requires evidence. Each is said beside the control, so the refusal is a reminder rather than news |
| The Attribute value-kind control is deliberately absent after creation | Its route refuses while active-lifecycle Offerings hold values. Offering a change that is almost always refused teaches an Admin to expect refusals rather than understand them |
| The Admin cannot tell which of the three entry conditions failed | The API answers them identically. A screen that distinguished them would be a way of testing whether an Admin authorization exists |
| Retired Categories, retired allowed values and Archived Offerings stay visible | Retirement is not deletion. Hiding them would hide the explanation for values and Offerings that still name them |

## Corrections and additions to existing code

| What | Why it mattered |
|---|---|
| `SUSPENDED` was an unreachable member of the authentication refusal type | `US-IDN-F03-001` AC-4 and AC-5 return one identical `401` for wrong password, unknown address and Suspended. A member for it invited a screen to distinguish what the API deliberately does not |
| The owner content read returned no Attribute definitions | Without them the edit screen cannot choose an input control, so the Universal Publication Minimum could never be satisfied through the UI |
| The Decision Context could not say whether an Affiliate path existed | The screen would have had to offer the path always and let the refusal explain, which §9 forbids |
| `SaveState` and three other state types lived beside their server actions | A `"use server"` module may export only async functions. Caught by the build, and each now records the rule where it was moved |
| ESLint gained `argsIgnorePattern: "^_"` | `useActionState` hands every action a previous state and a form; an action that moves a lifecycle wants neither. Inventing a use for them would be worse than declaring them unused |

## Where the guarantees are weaker than they look

**A screen can only be as honest as the read it was given.** One gap is
load-bearing and recorded in the code:

- `applicableAttributes` carries active options only, because those are the ones
  a save may choose. An Offering holding a since-retired option therefore has a
  value the form cannot offer back, and the next save drops it. The screen names
  the value rather than rendering an empty cell, but the loss is real and
  belongs to the write path.

Three others were recorded here and have since been closed. Two were the same
mistake in different places — the platform knew something and had not published
it — and the third was an error in this record:

- The Decision Context now carries `selectionLost`, so UX-0009 §16's sentence
  is shown where it is true and nowhere else. It was always derivable: the flow
  still held the identifier while the Offering no longer resolved.
- The Offering create form now offers the Categories an Offering may be
  assigned to, read through the same predicate creation enforces. It took a
  typed identifier before.
- **This record claimed the error envelope drops everything but a code and a
  message. That was wrong.** The envelope has always carried `fieldErrors`, and
  the publication path was already publishing the Universal Publication
  Minimum's shortfalls there. The web client was discarding them, and the
  bounded correction path was sending its own shortfalls at the top level where
  the envelope could not carry them. Both are fixed; the shortfalls now reach
  the person in the platform's own terms.

**Every "the screen offers what the write path honours" claim rests on the API
composing correctly.** The web application checks nothing twice on purpose,
which means a composition bug reaches the person as an offered action that
fails — not as a screen quietly disagreeing with itself. That is the trade the
increment took deliberately, and it is only better if the compositions stay
tested where they are.

## Deferred with reason

| Item | Reason |
|---|---|
| Attribute value-kind change from the Admin screen | Recorded above. Belongs to a screen that can say when it would work |
| Any visual design | Every surface is semantic HTML with no styling beyond the existing stylesheet. UX documents specify behaviour, not appearance, and inventing appearance would put decisions in code that no document owns |
| Outbound email vendor adapter | The port exists and the development adapter refuses to construct in production. Choosing a vendor is an Owner decision |
| Decision Chat assistant vendor adapter | Same shape, same reason. The restating adapter is the floor of `US-DEC-F03-001` AC-5 and passes the same invention check a vendor would |
| UX-0007 Messaging | Not in V1. The Decision flow and the correction notices each say so where a message box would otherwise be invented |

## Known boundaries

- Twenty-two routes. Every one re-evaluates its entry conditions on every
  request rather than trusting the navigation that reached it.
- No page composes an availability rule. `offersEdit`, `offers`,
  `enableAvailable`, `offersCreate` and `noticeEntry` each read an answer the
  API already gave.
- The Comparison Set and the Decision flow are each held as an identifier and
  nothing else. Everything about either lives on the server and expires there,
  which is what makes "no saved Compare history" and "limited to the current
  Decision flow" properties of the system rather than promises about the
  browser. The application writes two other cookies: the session token, and the
  Discovery entry the public journey already carried.
- The only page that renders a Business's protected contact information is the
  Decision reveal, and only from the response to the request that asked for it.
- Three surfaces state an absence rather than filling it: no Messaging where a
  Business supplied no contact channel, no inbox in correction notices, and no
  substitute queue where the Affiliate workload is empty. A fourth absence has
  nothing to state it — the Admin Dashboard has no configuration area, and no
  sentence announcing one it does not have.

## Story governance

All 50 Generated Stories remain `Delivery Status: Not Started`. I8 implements no
Story — it implements the nine Frozen UX documents against Stories already
closed in I1 through I7. Advancing any Delivery Status remains a separate change
with Product Owner review and green CI evidence. This record extends
`I1_IDENTITY_BASELINE_CLOSURE.md`,
`I2_CATALOG_AND_WRITE_MODEL_CLOSURE.md`,
`I3_PUBLICATION_AND_DISCOVERY_CLOSURE.md`,
`I4_PUBLIC_WEB_JOURNEY_CLOSURE.md`,
`I5_COMPARE_AND_DECISION_CLOSURE.md`,
`I6_BUSINESS_MANAGEMENT_CLOSURE.md` and
`I7_ADMIN_OPERATIONS_CLOSURE.md`.
