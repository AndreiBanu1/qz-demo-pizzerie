import type { MenuItem } from "../content/menu";

export const CATEGORIES: { label: MenuItem["category"]; id: string }[] = [
  { label: "Pizza", id: "pizza" },
  { label: "Paste", id: "paste" },
  { label: "Desert", id: "desert" },
  { label: "Băuturi", id: "bauturi" },
];

/** Pinned to the top of the screen while the menu scrolls. */
export default function CategoryChips() {
  return (
    <nav aria-label="Categorii" className="sticky top-0 z-10 -mx-4 border-b border-ink/10 bg-cream/95 px-4 py-3 backdrop-blur">
      <ul className="flex gap-2 overflow-x-auto">
        {CATEGORIES.map((c) => (
          <li key={c.id} className="shrink-0">
            <a
              href={`#${c.id}`}
              className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-ink/15 transition-colors hover:bg-ink hover:text-cream"
            >
              {c.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
