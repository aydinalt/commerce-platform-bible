import { hash, verify, type Algorithm } from "@node-rs/argon2";
import { Injectable } from "@nestjs/common";

/**
 * `Algorithm.Argon2id`. The library declares `Algorithm` as an ambient const
 * enum, which `isolatedModules` cannot inline, so the published numeric value
 * is used directly. `PasswordHasher` is covered by a test asserting the
 * produced digest carries the `$argon2id$` prefix, so this cannot drift
 * unnoticed.
 */
const ARGON2ID = 2 as Algorithm;

/**
 * Argon2id is mandated by ADR-0012 §2 and `V1_SECURITY_ARCHITECTURE.md`.
 * Parameters follow the OWASP baseline; they are deliberately explicit rather
 * than defaulted, so a library change cannot quietly weaken them.
 */
const OPTIONS = {
  algorithm: ARGON2ID,
  memoryCost: 19 * 1024,
  outputLen: 32,
  parallelism: 1,
  timeCost: 2
} as const;

@Injectable()
export class PasswordHasher {
  hash(password: string): Promise<string> {
    return hash(password, OPTIONS);
  }

  /**
   * Never throws on a malformed stored hash. A corrupt row must read as a
   * failed credential, not as a server error that distinguishes it from a
   * wrong password.
   */
  async matches(storedHash: string, password: string): Promise<boolean> {
    try {
      return await verify(storedHash, password, OPTIONS);
    } catch {
      return false;
    }
  }
}
