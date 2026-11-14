/** Shown first on every page, with no way to close it. */
/** `lang` is set only on the English report page, where this Romanian banner sits inside an English document. */
export default function DemoBanner({ lang }: { lang?: "ro" }) {
  return (
    <aside aria-label="Despre acest site" lang={lang} className="bg-ink text-cream">
      <a
        href="https://qualityzone.netlify.app/ro"
        className="block px-4 py-2 text-center text-sm font-medium underline decoration-crust/70 underline-offset-4 hover:decoration-cream"
      >
        Site demonstrativ realizat de Quality Zone
      </a>
    </aside>
  );
}
