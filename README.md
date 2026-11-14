# Pizza Mița (demo)

A demo website for a fictional Romanian pizzeria, made by [Quality Zone](https://qualityzone.netlify.app/ro) as a before/after quality case study. I built a deliberately weak version of the site, audited it with automated tools, fixed what I found, and audited it again.

Pizza Mița is not a real business:

- Every page carries the banner „Site demonstrativ realizat de Quality Zone”, which links to Quality Zone and can't be closed.
- The phone number (0000 000 000) and the address (Strada Exemplului 0, Orașul Demo) are fake.
- Every page is `noindex`, so search engines are asked to leave it out.

## The two versions

Both are hosted on Cloudflare Pages:

- https://pizza-mita-inainte.pages.dev is the weak "before" version (the `before` branch, never changed after the first audit).
- https://pizza-mita.pages.dev is the fixed version (this branch, `main`).

## The report

The audit report is part of the fixed site, in Romanian and in English:

- `/raport` (https://pizza-mita.pages.dev/raport)
- `/raport/en` (https://pizza-mita.pages.dev/raport/en)
- the same report as PDFs: `public/raport/pizza-mita-audit-ro.pdf` and `public/raport/pizza-mita-audit-en.pdf`, served at `/raport/pizza-mita-audit-ro.pdf` and `/raport/pizza-mita-audit-en.pdf`

Every figure in the report comes from the raw files of the two audit runs. Those files are published with the site under `/raport/date/<run>/`, and they are also in `audit/runs/` in this repository. Which two runs the report uses is set in `audit/report-run.json`.

## Fix history

The `before` branch is frozen, and the tag `before-v2` marks the exact commit that was audited as "before". On `main`, each finding in the report has its own commit, named `fix(F-NN): …`, so you can open the commit for any finding and see exactly what changed.

## Running an audit

```sh
npm run audit -- before   # audit the weak site
npm run audit -- after    # audit the fixed site
npm run audit -- both     # audit both, one after the other
```

A run measures speed (Lighthouse), accessibility (axe), security headers (Mozilla Observatory), SEO checks on the HTML and a set of Playwright tests, and writes everything to `audit/runs/<date>-<before|after>/`. See `audit/manual-template.md` for the manual checks that no tool can do.

## Commands

- `npm run dev` starts the dev server
- `npm run build` builds into `dist/`: the site, the prerendered pages, the raw runs for the report, `dist/version.json`, and the checks (SEO, planted-issue markers, report links)
- `npm test` runs the unit tests
- `npm run pdf` rebuilds the two report PDFs from the built site (run `npm run build` first)

## Photo credits

All photos are from Pexels. The photographers and their pages are listed in [CREDITS.md](CREDITS.md).
