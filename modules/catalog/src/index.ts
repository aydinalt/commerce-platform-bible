/**
 * The three V1 Domains, fixed by PRD-0001 and by `US-PLT-F08-001` AC-1. No
 * Story gives anyone authority to add a fourth, and AC-15 rules out moving a
 * Category between them, so this list is closed rather than configurable.
 */
export const V1_DOMAINS = ["MOBILITY", "REAL_ESTATE", "TECHNOLOGY"] as const;

export type V1Domain = (typeof V1_DOMAINS)[number];

export interface CategoryRecord {
  /// Retired Categories keep their row and stay readable (AC-14).
  active: boolean;
  domain: V1Domain;
  id: string;
  name: string;
  /// `null` for a root, which is the only kind of Category that names its own
  /// Domain (AC-6). A child inherits it (AC-7).
  parentId: string | null;
  slug: string;
  stableKey: string;
}

/**
 * Raised when an Offering names a Category it may not be assigned to (AC-8).
 *
 * "Assignable" means active *and* a leaf: a Category with active children is a
 * branch of the hierarchy and carries no Offerings of its own. A retired
 * Category is excluded by the same rule, which is what AC-14 asks for.
 *
 * The condition is evaluated inside the assignment write rather than before it.
 * Checking first and writing after leaves a window in which a Category is
 * retired between the two, and AC-12 promised the retiring Admin that no
 * assigned Offering remained.
 */
export class CategoryNotAssignableError extends Error {
  constructor(readonly categoryId: string) {
    super("CATEGORY_NOT_ASSIGNABLE");
    this.name = "CategoryNotAssignableError";
  }
}

/**
 * Raised when a proposed parent would put a Category inside its own ancestry
 * (AC-5). Translated from the database trigger that detects it, so no caller
 * inspects PostgreSQL constraint names.
 */
export class CategoryCycleError extends Error {
  constructor() {
    super("CATEGORY_ANCESTRY_CYCLE");
    this.name = "CategoryCycleError";
  }
}

/**
 * Raised when a proposed parent belongs to another Domain (AC-10). Reparenting
 * moves a Category within its Domain; it never migrates it across one.
 */
export class CategoryDomainMismatchError extends Error {
  constructor() {
    super("CATEGORY_DOMAIN_MISMATCH");
    this.name = "CategoryDomainMismatchError";
  }
}

/// Why a retirement was refused (AC-12). Archived Offerings are absent by
/// design: AC-13 makes historical association harmless.
export type RetirementBlocker = "ACTIVE_CHILD" | "ASSIGNED_OFFERING";

export class CategoryRetirementBlockedError extends Error {
  constructor(readonly blocker: RetirementBlocker) {
    super("CATEGORY_RETIREMENT_BLOCKED");
    this.name = "CategoryRetirementBlockedError";
  }
}

/// Raised when a child is proposed under a retired parent. Retirement is only
/// legal while no active child remains (AC-12), so adding one afterwards would
/// undo the condition that permitted it.
export class CategoryParentRetiredError extends Error {
  constructor(readonly parentId: string) {
    super("CATEGORY_PARENT_RETIRED");
    this.name = "CategoryParentRetiredError";
  }
}

export class CategoryKeyConflictError extends Error {
  constructor(readonly conflict: "SLUG" | "STABLE_KEY") {
    super("CATEGORY_KEY_CONFLICT");
    this.name = "CategoryKeyConflictError";
  }
}

export const catalogModule = { name: "catalog" } as const;
