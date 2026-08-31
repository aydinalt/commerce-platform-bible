"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Share, across the five channels the Owner named.
 *
 * **Plain links, no vendor script.** Every one of these five is a URL with a
 * query string; the alternative — WhatsApp's, Meta's and X's own share
 * widgets — costs five third-party scripts that each set a cookie and each
 * watch the page whether or not anybody clicks. A comparison site whose
 * product is trust should not pay that price for a button.
 *
 * Instagram is the odd one and it is honest about it: Instagram has no share
 * URL for arbitrary links, so the entry copies the address instead and says
 * so. Drawing an Instagram button that silently did nothing would be worse
 * than not drawing one.
 */

const ICONS: Record<string, string> = {
  eposta: "M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Zm1.8.5 7.2 5.2L19.2 7",
  facebook:
    "M14 8.5V7c0-.8.2-1.2 1.3-1.2H17V3h-2.4C11.8 3 11 4.3 11 6.4v2.1H9V12h2v9h3v-9h2.3l.4-3.5H14Z",
  instagram:
    "M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9A4.5 4.5 0 0 1 16.5 21h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm4.5 5.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm5-1.4a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z",
  whatsapp:
    "M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Zm4.6 12.3c-.2.6-1.1 1.1-1.6 1.1-.4 0-.9.1-3-.8-2.5-1.1-4.1-3.7-4.2-3.9-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.3.3c-.1.1-.3.3-.1.6.1.3.7 1.2 1.5 1.9 1 .9 1.8 1.2 2.1 1.3.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z",
  x: "M17.5 3h3l-6.6 7.6L21.7 21h-6l-4.7-6.2L5.6 21h-3l7-8L2.6 3h6.1l4.3 5.7L17.5 3Zm-1 16h1.7L8.6 4.8H6.8L16.5 19Z"
};

export function ShareMenu({
  title,
  url
}: {
  title: string;
  /** The address being shared. Absolute, because a WhatsApp message with a
   *  relative path in it is a message nobody can open. */
  url: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node))
        setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const text = `${title} — en uygun fiyatlar`;
  const links = [
    {
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      icon: "whatsapp",
      label: "WhatsApp"
    },
    {
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: "facebook",
      label: "Facebook"
    },
    {
      href: `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      icon: "x",
      label: "X"
    },
    {
      href: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
      icon: "eposta",
      label: "E-posta"
    }
  ];

  const copy = () => {
    void navigator.clipboard?.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative" ref={box}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path
            d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 15V3m0 0L8.5 6.5M12 3l3.5 3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Paylaş
      </button>

      {!open ? null : (
        <div
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          role="menu"
        >
          {links.map((link) => (
            <a
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
              href={link.href}
              key={link.label}
              rel="noopener noreferrer"
              role="menuitem"
              target="_blank"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-slate-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d={ICONS[link.icon] ?? ""} />
              </svg>
              {link.label}
            </a>
          ))}

          <button
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
            onClick={copy}
            role="menuitem"
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-slate-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d={ICONS.instagram ?? ""} />
            </svg>
            <span>
              Instagram
              <span className="block text-[11px] text-slate-500">
                Bağlantıyı kopyalar
              </span>
            </span>
          </button>

          {!copied ? null : (
            <p
              className="border-t border-slate-100 px-4 py-2 text-[12px] text-emerald-700"
              role="status"
            >
              Bağlantı kopyalandı.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
