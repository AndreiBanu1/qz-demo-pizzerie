// The report's route element. The report and its data live in their own chunk, so the restaurant pages
// don't download it. The prerender and the browser both call loadReport() before rendering a report page,
// so the first render (and hydration) uses the loaded component directly; client-side navigation to the
// report falls back to React.lazy until the chunk arrives.
import { lazy, Suspense, type ComponentType } from "react";

type Props = { lang: "ro" | "en" };

let Loaded: ComponentType<Props> | null = null;

export function loadReport(): Promise<unknown> {
  return import("./Report").then(async (m) => {
    await m.loadSummaries();
    Loaded = m.default;
    return m;
  });
}

const LazyReport = lazy(() => loadReport().then(() => ({ default: Loaded! })));

export default function ReportRoute({ lang }: Props) {
  if (Loaded) return <Loaded lang={lang} />;
  return (
    <Suspense fallback={<p className="mx-auto max-w-3xl px-4 py-16 text-muted">{lang === "en" ? "Loading the report…" : "Se încarcă raportul…"}</p>}>
      <LazyReport lang={lang} />
    </Suspense>
  );
}
