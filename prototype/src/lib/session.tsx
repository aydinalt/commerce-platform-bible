"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

/**
 * Who is signed in, and what they have kept.
 *
 * **In memory, for the length of one visit.** The prototype has no server and
 * no storage, and the honest way to show that is to let a reload clear it
 * rather than to fake persistence with `localStorage` — a favourites list that
 * survives a reload but exists in no account is a promise the real platform
 * would then have to break.
 *
 * Favourites and sign-in live in one context because they are one decision:
 * `US-IDN-*` puts the saved list behind an account, so the heart on a card has
 * to be able to ask whether there is one and to open the sign-in when there is
 * not. Two contexts would mean the heart knowing about a hook it should not.
 */

export interface Account {
  name: string;
  email: string;
}

interface Session {
  account: Account | null;
  favourites: string[];
  isFavourite: (id: string) => boolean;
  toggleFavourite: (id: string) => void;
  signIn: (account: Account) => void;
  signOut: () => void;
  /** Which dialog is open, if any. The header and the heart both open it. */
  gate: "login" | "register" | null;
  openGate: (gate: "login" | "register") => void;
  closeGate: () => void;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [gate, setGate] = useState<"login" | "register" | null>(null);

  const toggleFavourite = useCallback(
    (id: string) => {
      /*
       * A Guest gets the sign-in rather than a silent failure or a list that
       * disappears the moment they do sign in. Which of the two the platform
       * offers is a real product decision; this prototype takes the position
       * that a favourite belongs to an account, because that is what makes it
       * worth having.
       */
      if (account === null) {
        setGate("login");
        return;
      }
      setFavourites((current) =>
        current.includes(id)
          ? current.filter((entry) => entry !== id)
          : [...current, id]
      );
    },
    [account]
  );

  const value = useMemo<Session>(
    () => ({
      account,
      closeGate: () => setGate(null),
      favourites,
      gate,
      isFavourite: (id) => favourites.includes(id),
      openGate: (next) => setGate(next),
      signIn: (next) => {
        setAccount(next);
        setGate(null);
      },
      signOut: () => {
        setAccount(null);
        setFavourites([]);
      },
      toggleFavourite
    }),
    [account, favourites, gate, toggleFavourite]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (session === null) throw new Error("SESSION_PROVIDER_MISSING");
  return session;
}
