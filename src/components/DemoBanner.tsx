/** Shown first on every page, with no way to close it. */
export default function DemoBanner() {
  return (
    <aside aria-label="Despre acest site" className="bg-ink text-cream">
      <a
        href="https://qualityzone.netlify.app/ro"
        className="block px-4 py-2 text-center text-sm font-medium underline decoration-crust/70 underline-offset-4 hover:decoration-cream"
      >
        Site demonstrativ realizat de Quality Zone
      </a>
    </aside>
  );
}
