// The report's words, in Romanian and English. No measured number is typed here: every figure
// arrives as a template argument, read from a summary.json or from audit/findings.ts
// (copy.test.ts checks that this file holds no digits, apart from two device names).
// Romanian speaks to the reader as „tu”, in the first person singular, and explains each
// technical term once, where it first appears.
import type { Area, Severity, Status } from "../../../audit/findings";
import type { AreaColour } from "./area-status";
import type { Direction } from "./format";

export type Lang = "ro" | "en";

type P = Record<string, string>;
type T<K extends string> = (p: Record<K, string>) => string;

export type ReportCopy = {
  months: readonly string[];
  /** The link to the other language. */
  switchTo: { label: string; lang: Lang; path: string };
  kicker: string;
  h1: string;
  lead: readonly string[];
  checkYourself: string;
  links: { before: string; after: string; repo: string; pdf: string };
  /** Where the PDF copy of this language's report is served. */
  pdfHref: string;

  /** Spec §8 part 1. */
  summary: {
    heading: string;
    stats: { found: string; fixed: string; partly: string; notFixed: string; wontFix: string };
    topHeading: string;
    details: T<"id">;
    fixLabel: string;
    areasHeading: string;
    areasTable: { caption: string; area: string; before: string; after: string };
    legend: readonly string[];
    headlineHeading: string;
    tiles: {
      speed: { label: string; explain: string; weight: T<"before" | "after">; alreadyHigh: string };
      qa: { label: string; explain: string; outOf: T<"total"> };
      observatory: { label: string; explain: string };
      axe: { label: string; explain: string; scope: string };
    };
    tocHeading: string;
  };
  areas: Record<Area, { name: string; about: string }>;
  colours: Record<AreaColour, string>;
  beforeWord: string;
  afterWord: string;

  /** Spec §8 part 2. */
  scorecard: {
    heading: string;
    intro: T<"before" | "after">;
    /** Shown after the intro when the report's after run replaced an earlier one. */
    measuredTwice: string;
    lighthouse: string;
    termsHeading: string;
    terms: { lcp: string; cls: string; tbt: string; csp: string };
    rounding: string;
    caption: string;
    cols: { what: string; before: string; after: string; diff: string };
    pageGroup: T<"page">;
    siteGroup: string;
    lighthouseRows: Record<
      "performance" | "accessibility" | "seo" | "bestPractices" | "lcpMs" | "cls" | "tbtMs" | "bytes" | "renderBlockingMs",
      string
    >;
    axeRow: string;
    rows: {
      qa: string;
      observatoryGrade: string;
      observatoryScore: string;
      headers: string;
      exposed: string;
      npmAudit: string;
      seoChecks: string;
      linksChecked: string;
      linksBroken: string;
    };
    notes: {
      seo: T<"id">;
      bestPractices: T<"id">;
      observatoryScore: string;
      headersMissing: T<"names">;
      linkinator: string;
      seoChecks: string;
      linksChecked: T<"id">;
      linksBroken: T<"id">;
    };
    outOf: T<"a" | "b">;
    direction: Record<Direction, string>;
  };

  /** Spec §8 part 3. */
  findings: {
    heading: string;
    intro: readonly string[];
    rubricHeading: string;
    severity: Record<Severity, string>;
    rubric: Record<Severity, string>;
    status: Record<Status, string>;
    labels: {
      severity: string;
      area: string;
      pages: string;
      allPages: string;
      status: string;
      what: string;
      why: string;
      fix: string;
      evidence: string;
      rawFiles: string;
      screenshots: string;
      fixOnGitHub: string;
      severalCommits: string;
      wontFix: string;
    };
    commit: T<"sha">;
    run: { before: string; after: string };
    rawGroup: { lighthouse: T<"page">; axe: T<"page">; run: T<"n" | "run" | "group">; device: T<"device" | "run" | "group"> };
    screenshot: T<"device">;
  };
  evidence: {
    page: Record<"acasa" | "meniu" | "rezervare", string>;
    device: Record<string, string>;
    missing: string;
    none: string;
    yes: string;
    no: string;
    failedTest: string;
    passesNow: string;
    stillFails: string;
    goneNow: string;
    stillThere: string;
    seo: Record<string, string>;
    header: T<"name">;
    frameAncestors: string;
    axeRules: string;
    axeViolations: string;
    observatoryGrade: string;
    observatoryScore: string;
    headersPresent: string;
    exposedPath: string;
    exposedStatus: string;
    npmAudit: T<"level">;
    npmLevels: Record<"critical" | "high" | "moderate" | "low", string>;
    linksChecked: string;
    lighthouse: T<"metric">;
    /** axe rule ids in plain words; an id not listed is shown as it is. */
    axeRuleNames: Record<string, string>;
    /** Security header names in plain words, for the scorecard note. */
    headerNames: Record<string, string>;
  };

  /** Spec §8 part 4. */
  planted: {
    heading: string;
    intro: T<"count">;
    answerKey: string;
    tools: { heading: string; about: string };
    qaOnly: { heading: string; about: string };
    notCaught: { heading: string; about: string; empty: string };
    unplanted: { heading: string; about: string };
    notes: { axeMissed: T<"page" | "rules">; placeholderName: string; linkinatorMissed: T<"checked"> };
  };

  /** Spec §8 part 5. */
  method: {
    heading: string;
    runsHeading: string;
    run: { before: string; after: string };
    runLine: T<"date">;
    deployed: T<"sha">;
    devicesHeading: string;
    devices: readonly string[];
    toolsHeading: string;
    toolsSame: string;
    toolsPerRun: T<"run">;
    toolsOnline: readonly string[];
    limitsHeading: string;
    limits: {
      lab: string;
      median: string;
      noindex: T<"id">;
      manual: string;
      iphone: string;
      hsts: string;
      activeSecurity: string;
      notAudited: string;
      /** The earlier after run that the report's after run replaced, and why. */
      measuredTwice: T<"score" | "firstRun" | "firstDate" | "id" | "sha" | "run">;
      measuredTwiceLink: string;
    };
    psiHeading: string;
    psiAbout: string;
    psiLink: T<"page">;
    rawHeading: string;
    rawAbout: string;
    rawSummary: T<"run">;
    rawGitHub: T<"run">;
  };
};

/** Romanian puts "de" between a number and its noun from twenty on (and after round hundreds): „80 de teste”. */
const de = (n: string) => {
  const v = Number(n);
  return Number.isInteger(v) && v > 0 && (v % 100 === 0 || v % 100 >= 20) ? " de" : "";
};

const ro: ReportCopy = {
  months: [
    "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
    "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
  ],
  switchTo: { label: "Read this report in English", lang: "en", path: "/raport/en" },
  kicker: "Studiu de caz Quality Zone · site demonstrativ",
  h1: "Raportul auditului pentru Pizza Mița",
  lead: [
    "Pizza Mița e o pizzerie inventată. Am construit întâi, intenționat, o versiune slabă a site-ului, cu probleme plantate de mine și trecute dinainte pe o listă. Am verificat-o cu unelte automate, am reparat ce am găsit, apoi am măsurat din nou ambele versiuni, cu aceleași unelte, de pe același calculator.",
    "Așa arată raportul pe care l-ai primi pentru site-ul tău: ce nu merge, de ce contează pentru afacerea ta și ce am reparat. Fiecare cifră de aici vine din fișierele brute ale măsurătorilor, pe care le poți deschide și tu.",
  ],
  checkYourself: "Verifică singur:",
  links: { before: "Site-ul înainte", after: "Site-ul reparat", repo: "Codul și datele, pe GitHub", pdf: "Raportul, ca PDF" },
  pdfHref: "/raport/pizza-mita-audit-ro.pdf",

  summary: {
    heading: "Pe scurt",
    stats: {
      found: "Probleme găsite",
      fixed: "Reparate",
      partly: "Reparate parțial",
      notFixed: "Nereparate",
      wontFix: "Lăsate intenționat",
    },
    topHeading: "Problemele care contează cel mai mult",
    details: ({ id }) => `Detalii (${id})`,
    fixLabel: "Reparația:",
    areasHeading: "Fiecare zonă, înainte și după",
    areasTable: { caption: "Culoarea fiecărei zone, înainte și după reparații", area: "Zona", before: "Înainte", after: "După" },
    legend: [
      "Roșu: cel puțin o problemă critică sau mare. Galben: cel puțin o problemă medie. Verde: nimic mai grav decât detalii mărunte.",
      "După reparații, număr doar problemele rămase deschise; cea lăsată intenționat nu intră la socoteală.",
    ],
    headlineHeading: "Cifrele principale",
    tiles: {
      speed: {
        label: "Scorul de viteză al paginii de meniu",
        explain:
          "Lighthouse, unealta Google care măsoară cât de repede se încarcă o pagină pe telefon, dă o notă: cu cât e mai mare, cu atât mai bine.",
        weight: ({ before, after }) => `Greutatea paginii: ${before} înainte, ${after} după.`,
        alreadyHigh:
          "Nota era deja mare, dar ea măsoară mai ales cât de repede apare primul ecran, nu cât descarcă pagina în total.",
      },
      qa: {
        label: "Teste automate picate",
        explain:
          "Am scris teste automate, cu Playwright, care folosesc site-ul ca un vizitator: pe un iPhone, pe un telefon Android și pe un calculator, toate simulate.",
        outOf: ({ total }) => `din ${total}${de(total)} teste`,
      },
      observatory: {
        label: "Nota de securitate",
        explain:
          "Mozilla HTTP Observatory, un test public, notează de la F la A+ protecțiile pe care site-ul i le cere browserului.",
      },
      axe: {
        label: "Probleme de accesibilitate găsite de axe",
        explain:
          "axe e o unealtă care verifică automat dacă paginile pot fi folosite de oricine, inclusiv de cine vede slab sau folosește un program care citește ecranul cu voce tare.",
        scope: "adunate pe toate paginile și pe toate dispozitivele testate",
      },
    },
    tocHeading: "Mai departe în raport",
  },
  areas: {
    speed: { name: "Viteză", about: "cât de repede apare site-ul pe telefon" },
    accessibility: { name: "Accesibilitate", about: "dacă îl poate folosi oricine, inclusiv cine vede slab" },
    qa: { name: "Funcționare", about: "dacă butoanele, formularele și linkurile fac ce trebuie" },
    seo: { name: "Google (SEO)", about: "dacă motoarele de căutare înțeleg paginile" },
    security: { name: "Securitate", about: "protecțiile de bază pe care le cere site-ul" },
  },
  colours: { rosu: "Roșu", galben: "Galben", verde: "Verde" },
  beforeWord: "înainte",
  afterWord: "după",

  scorecard: {
    heading: "Înainte și după, în cifre",
    intro: ({ before, after }) =>
      `Am măsurat ambele versiuni în aceeași zi, de pe același calculator, cu aceleași unelte: versiunea slabă pe ${before}, cea reparată pe ${after}, ora României.`,
    measuredTwice: "Versiunea reparată am măsurat-o de două ori; explic de ce la limite, la final.",
    lighthouse:
      "Scorurile, LCP, CLS, TBT, greutatea paginii și întârzierea vin din Lighthouse, pe un telefon simulat. Fiecare e mediana a trei rulări, adică valoarea din mijloc.",
    termsHeading: "Câțiva termeni",
    terms: {
      lcp: "LCP (Largest Contentful Paint) e timpul până apare pe ecran cel mai mare element al paginii, de obicei poza sau titlul de sus.",
      cls: "CLS (Cumulative Layout Shift) arată cât sar bucățile paginii în timp ce se încarcă; cu cât e mai aproape de zero, cu atât mai bine.",
      tbt: "TBT (Total Blocking Time) e timpul în care pagina, cât se încarcă, e prea ocupată ca să răspundă când o atingi.",
      csp: "CSP (Content Security Policy) e o listă trimisă browserului cu locurile din care pagina are voie să încarce cod, imagini și fonturi; orice altceva e blocat.",
    },
    rounding:
      "Cum am rotunjit: LCP în secunde, cu o zecimală; TBT în milisecunde, rotunjit la zece, ca în Lighthouse; CLS cu două zecimale; greutatea paginii în MB, cu o zecimală, iar sub un MB în kB întregi. Diferența e calculată din valorile nerotunjite și rotunjită la fel.",
    caption: "Înainte și după, pe fiecare pagină și pe tot site-ul",
    cols: { what: "Ce am măsurat", before: "Înainte", after: "După", diff: "Diferența" },
    pageGroup: ({ page }) => `Pagina ${page}`,
    siteGroup: "Tot site-ul",
    lighthouseRows: {
      performance: "Scorul de viteză",
      accessibility: "Scorul de accesibilitate",
      seo: "Scorul SEO",
      bestPractices: "Scorul de bune practici",
      lcpMs: "LCP",
      cls: "CLS",
      tbtMs: "TBT",
      bytes: "Greutatea paginii",
      renderBlockingMs: "Întârzierea din fișiere care țin afișarea pe loc (estimare)",
    },
    axeRow: "Probleme găsite de axe, pe toate dispozitivele",
    rows: {
      qa: "Teste Playwright trecute",
      observatoryGrade: "Nota Mozilla HTTP Observatory",
      observatoryScore: "Scorul Mozilla HTTP Observatory",
      headers: "Instrucțiuni de siguranță trimise browserului (CSP și altele)",
      exposed: "Fișiere de cod sursă pe care le poate descărca oricine",
      npmAudit: "Probleme cunoscute în uneltele de construire (npm audit)",
      seoChecks: "Verificări SEO trecute, făcute de mine pe pagina așa cum o primește Google",
      linksChecked: "Adrese urmărite de linkinator",
      linksBroken: "Linkuri stricate găsite de linkinator",
    },
    notes: {
      seo: ({ id }) =>
        `Nu e maxim doar din cauza cererii noindex, prin care rog Google să nu afișeze site-ul, pusă intenționat (${id}).`,
      bestPractices: ({ id }) =>
        `A scăzut doar pentru că, la măsurătoare, site-ul nu avea iconiță de filă (favicon), iar de la ${id} adresa ei răspundea corect „nu există”.`,
      observatoryScore: "Mozilla dă și puncte bonus, așa că scorul poate trece de o sută.",
      headersMissing: ({ names }) => `Lipsește: ${names}. Vezi limitele, la final.`,
      seoChecks:
        "Pe fiecare pagină: un titlu propriu, o descriere, un singur titlu principal, limba română, adresa canonică (adresa oficială a paginii) și text în pagina primită; plus datele despre restaurant pe Acasă și pe Meniu.",
      linkinator: "linkinator e o unealtă care urmează automat toate linkurile dintr-un site și le notează pe cele stricate.",
      linksChecked: ({ id }) =>
        `Pe versiunea slabă, paginile soseau goale (${id}), așa că n-a avut linkuri pe care să le urmeze.`,
      linksBroken: ({ id }) => `Linkul stricat din subsol (${id}) l-au găsit doar testele Playwright.`,
    },
    outOf: ({ a, b }) => `${a} din ${b}`,
    direction: { better: "mai bine", worse: "mai rău", same: "la fel" },
  },

  findings: {
    heading: "Ce am găsit și ce am reparat",
    intro: [
      "Fiecare problemă are o gravitate, zona și paginile pe care apare, dovezile din măsurători, reparația și starea ei la măsurătoarea de după.",
      "Fiecare reparație e un commit, adică o modificare salvată, cu dată, în istoricul public al codului. Poți deschide fiecare commit pe GitHub.",
    ],
    rubricHeading: "Cum am stabilit gravitatea",
    severity: { critica: "Critică", mare: "Mare", medie: "Medie", mica: "Mică" },
    rubric: {
      critica: "Un client nu poate suna, nu poate citi meniul sau nu poate rezerva o masă, ori ceva expune site-ul.",
      mare: "Afectează mulți vizitatori, sau Google nu poate citi pagina.",
      medie: "Încetinește sau încurcă o parte dintre vizitatori.",
      mica: "Finisaj.",
    },
    status: { fixed: "Reparat", partly: "Reparat parțial", "not-fixed": "Nereparat", "wont-fix": "Lăsat intenționat" },
    labels: {
      severity: "Gravitate",
      area: "Zona",
      pages: "Pagini",
      allPages: "Toate paginile",
      status: "Starea după măsurătoarea nouă",
      what: "Ce am găsit",
      why: "De ce contează",
      fix: "Reparația",
      evidence: "Dovezi",
      rawFiles: "Fișierele brute",
      screenshots: "Capturi de ecran ale testelor picate, înainte",
      fixOnGitHub: "Reparația, pe GitHub",
      severalCommits: "Reparația s-a făcut în mai multe commituri, în ordine:",
      wontFix: "De ce n-am schimbat nimic",
    },
    commit: ({ sha }) => `Commit ${sha}`,
    run: { before: "Înainte", after: "După" },
    rawGroup: {
      lighthouse: ({ page }) => `Lighthouse, ${page}`,
      axe: ({ page }) => `axe, ${page}`,
      run: ({ n, run, group }) => `${group}, rularea ${n}, ${run}`,
      device: ({ device, run, group }) => `${group}, ${device}, ${run}`,
    },
    screenshot: ({ device }) => `Captură, ${device}`,
  },
  evidence: {
    page: { acasa: "Acasă", meniu: "Meniu", rezervare: "Rezervare" },
    device: { "iphone-15": "iPhone 15", "pixel-7": "Pixel 7", desktop: "calculator" },
    missing: "lipsește",
    none: "niciuna",
    yes: "da",
    no: "nu",
    failedTest: "Test Playwright picat",
    passesNow: "trece acum",
    stillFails: "încă pică",
    goneNow: "nu mai poate fi descărcat",
    stillThere: "încă poate fi descărcat",
    seo: {
      title: "Titlul paginii",
      description: "Descrierea pentru Google",
      h1Count: "Titluri principale în pagina primită",
      lang: "Limba declarată",
      canonical: "Adresa canonică",
      robots: "Cererea către Google (meta robots)",
      "jsonLd.types": "Date structurate găsite",
      restaurantFieldsMissing: "Date despre restaurant care lipsesc",
      words: "Cuvinte în pagina primită, înainte să ruleze programul ei",
    },
    header: ({ name }) => `Instrucțiunea ${name}`,
    frameAncestors: "CSP interzice afișarea în alte site-uri (frame-ancestors)",
    axeRules: "Reguli încălcate, după axe",
    axeViolations: "Probleme găsite de axe",
    observatoryGrade: "Nota Mozilla HTTP Observatory",
    observatoryScore: "Scorul Mozilla HTTP Observatory",
    headersPresent: "Instrucțiuni de siguranță trimise",
    exposedPath: "Fișier de cod sursă public",
    exposedStatus: "Răspunsul serverului pentru acel fișier",
    npmAudit: ({ level }) => `npm audit: probleme ${level}`,
    npmLevels: { critical: "critice", high: "grave", moderate: "moderate", low: "mici" },
    linksChecked: "Adrese urmărite de linkinator",
    lighthouse: ({ metric }) => `${metric} (Lighthouse)`,
    axeRuleNames: {
      "image-alt": "poze fără descriere text",
      "color-contrast": "text prea puțin diferit de fundal",
      label: "câmpuri fără etichetă",
    },
    headerNames: {
      "content-security-policy": "CSP",
      "strict-transport-security": "HSTS, instrucțiunea care obligă browserul să intre pe site doar prin conexiune securizată",
      "x-content-type-options": "instrucțiunea care oprește browserul să ghicească tipul fișierelor",
      "x-frame-options": "interdicția de a fi afișat în alte site-uri",
      "referrer-policy": "instrucțiunea despre ce adresă se trimite mai departe la un clic",
      "permissions-policy": "limitarea accesului la cameră, microfon sau locație",
    },
  },

  planted: {
    heading: "Ce am plantat și ce s-a găsit",
    intro: ({ count }) =>
      `Înainte de prima măsurătoare, am trecut pe o listă cele ${count}${de(count)} probleme plantate în versiunea slabă. Lista e publică, iar istoricul codului arată că a fost scrisă prima.`,
    answerKey: "Lista problemelor plantate, pe GitHub",
    tools: {
      heading: "Prinse de uneltele automate",
      about: "Lighthouse, axe, verificarea mea a paginii așa cum o primește Google, Mozilla HTTP Observatory și verificarea fișierelor publice.",
    },
    qaOnly: {
      heading: "Prinse doar de testele Playwright",
      about:
        "Uneltele automate de verificare nu le-au văzut. Le-au prins doar testele scrise de mine, care folosesc site-ul ca un vizitator. Verificări manuale nu am făcut.",
    },
    notCaught: {
      heading: "Neprinse",
      about: "Probleme plantate pe care nu le-a găsit nimic. Le arăt aici, nu le ascund.",
      empty: "Niciuna: fiecare problemă plantată a fost găsită.",
    },
    unplanted: {
      heading: "Probleme reale pe care nu le-am plantat",
      about: "Le-am găsit în timpul auditului, deși nu erau pe listă.",
    },
    notes: {
      axeMissed: ({ page, rules }) => `axe n-a semnalat-o: pe pagina ${page} a găsit doar ${rules}.`,
      placeholderName: "axe acceptă textul gri din interiorul câmpului drept nume al câmpului.",
      linkinatorMissed: ({ checked }) =>
        `linkinator a urmărit doar ${checked}${de(checked)} adrese și n-a găsit niciun link stricat, pentru că pe versiunea slabă paginile sosesc goale.`,
    },
  },

  method: {
    heading: "Cum am măsurat și ce limite are raportul",
    runsHeading: "Măsurătorile",
    run: { before: "Înainte: versiunea slabă", after: "După: versiunea reparată" },
    runLine: ({ date }) => `${date}, ora României`,
    deployed: ({ sha }) => `Codul măsurat: ${sha}`,
    devicesHeading: "Dispozitive",
    devices: [
      "Lighthouse: un telefon Android de gamă medie simulat (Moto G Power), cu internetul mobil și procesorul încetinite intenționat, setarea standard a Lighthouse pentru telefon.",
      "Playwright și axe: iPhone 15 (prin WebKit, motorul lui Safari), Pixel 7 (prin Chromium, motorul lui Chrome) și un calculator cu Chrome.",
    ],
    toolsHeading: "Unelte și versiuni",
    toolsSame: "Aceleași la ambele măsurători:",
    toolsPerRun: ({ run }) => `${run}:`,
    toolsOnline: [
      "Mozilla HTTP Observatory, serviciul public online",
      "npm audit, verificarea problemelor cunoscute din componentele site-ului",
    ],
    limitsHeading: "Limite",
    limits: {
      lab: "Sunt date de laborator, din unelte, nu de la vizitatori reali. Pe telefoanele clienților tăi, cifrele pot fi altele.",
      median:
        "Lighthouse dă rezultate puțin diferite la fiecare rulare, așa că am rulat fiecare pagină de trei ori și arăt mediana, adică valoarea din mijloc.",
      noindex: ({ id }) =>
        `Cererea noindex, prin care rog Google să nu afișeze site-ul, e pusă intenționat, pentru că e un site demonstrativ (${id}). De aceea scorul SEO din Lighthouse nu ajunge la maxim pe site-ul reparat.`,
      manual:
        "N-am făcut verificările manuale: ascultarea site-ului cu VoiceOver (cititorul de ecran al iPhone-ului), validatorul Schema.org și testul Rich Results de la Google. Rezultatele automate nu le înlocuiesc.",
      iphone:
        "Când scriu „iPhone”, mă refer la motorul lui Safari (WebKit), rulat de Playwright pe un calculator, cu ecranul unui iPhone, nu la un iPhone adevărat. N-am testat pe telefoane reale.",
      hsts:
        "N-am evaluat HSTS, instrucțiunea care obligă browserul să intre pe site doar prin conexiune securizată: adresele pages.dev sunt deja pe lista browserelor cu site-uri accesibile doar securizat.",
      activeSecurity:
        "N-am făcut teste de securitate active, adică încercări de atac, și nici teste ale conexiunii securizate (TLS), de care se ocupă Cloudflare. Am verificat doar ce trimite site-ul și ce fișiere poate descărca oricine.",
      notAudited:
        "Paginile acestui raport nu fac parte din măsurători. Nici verificarea linkurilor nu intră în ele, pentru că raportul trimite la fișierele brute ale măsurătorii care încă se făcea.",
      measuredTwice: ({ score, firstRun, firstDate, id, sha, run }) =>
        `Versiunea reparată am măsurat-o de două ori. Prima măsurătoare, ${firstRun}, făcută pe ${firstDate}, ora României, imediat după cea a versiunii slabe, a dat scorul de bune practici ${score} pe fiecare pagină: de la prima reparație ${id}, orice adresă care nu există primea răspunsul „pagină inexistentă”, inclusiv /favicon.ico, adresa iconiței de filă, care încă lipsea, iar browserul nota asta ca eroare. A doua reparație ${id}, commitul ${sha}, a adăugat iconița, iar raportul folosește măsurătoarea refăcută după ea, ${run}.`,
      measuredTwiceLink: "Toate fișierele primei măsurători, pe GitHub",
    },
    psiHeading: "Verifică singur viteza",
    psiAbout:
      "PageSpeed Insights, de la Google, rulează Lighthouse pe serverele Google, așa că cifrele tale vor fi puțin diferite de ale mele.",
    psiLink: ({ page }) => `${page}, în PageSpeed Insights`,
    rawHeading: "Datele brute",
    rawAbout:
      "Toate fișierele brute ale ambelor măsurători sunt publicate pe acest site și pe GitHub. Fișierul summary.json al fiecărei măsurători e sursa tuturor cifrelor din raport.",
    rawSummary: ({ run }) => `summary.json, ${run}`,
    rawGitHub: ({ run }) => `Toate fișierele, ${run}, pe GitHub`,
  },
};

const en: ReportCopy = {
  months: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  switchTo: { label: "Citește raportul în română", lang: "ro", path: "/raport" },
  kicker: "Quality Zone case study · demo site",
  h1: "Audit report for Pizza Mița",
  lead: [
    "Pizza Mița is a made-up pizzeria. I first built a weak version of its site on purpose, with problems I planted and wrote down on a list beforehand. I checked it with automated tools, fixed what I found, and then measured both versions again, with the same tools, from the same computer.",
    "This is the report you would get for your own site: what doesn't work, why it matters to your business and what I fixed. Every figure here comes from the raw files of the measurements, which you can open yourself.",
  ],
  checkYourself: "Check it yourself:",
  links: { before: "The site before", after: "The fixed site", repo: "Code and data, on GitHub", pdf: "The report, as a PDF" },
  pdfHref: "/raport/pizza-mita-audit-en.pdf",

  summary: {
    heading: "In short",
    stats: {
      found: "Problems found",
      fixed: "Fixed",
      partly: "Partly fixed",
      notFixed: "Not fixed",
      wontFix: "Left on purpose",
    },
    topHeading: "The problems that matter most",
    details: ({ id }) => `Details (${id})`,
    fixLabel: "The fix:",
    areasHeading: "Each area, before and after",
    areasTable: { caption: "The colour of each area, before and after the fixes", area: "Area", before: "Before", after: "After" },
    legend: [
      "Red: at least one critical or high problem. Yellow: at least one medium problem. Green: nothing worse than small details.",
      "After the fixes I count only the problems still open; the one left on purpose doesn't count.",
    ],
    headlineHeading: "The headline numbers",
    tiles: {
      speed: {
        label: "Speed score of the menu page",
        explain:
          "Lighthouse, Google's tool for measuring how fast a page loads on a phone, gives it a score: the higher, the better.",
        weight: ({ before, after }) => `Page weight: ${before} before, ${after} after.`,
        alreadyHigh:
          "The score was already high, but it mostly measures how fast the first screen appears, not how much the page downloads in total.",
      },
      qa: {
        label: "Automated tests failed",
        explain:
          "I wrote automated tests, with Playwright, that use the site the way a visitor does: on an iPhone, an Android phone and a computer, all simulated.",
        outOf: ({ total }) => `out of ${total} tests`,
      },
      observatory: {
        label: "Security grade",
        explain:
          "Mozilla HTTP Observatory, a public test, grades from F to A+ the protections the site asks the browser for.",
      },
      axe: {
        label: "Accessibility problems found by axe",
        explain:
          "axe is a tool that checks automatically whether the pages can be used by anyone, including people with poor eyesight or who use a program that reads the screen aloud.",
        scope: "added up over every page and every device tested",
      },
    },
    tocHeading: "Further in this report",
  },
  areas: {
    speed: { name: "Speed", about: "how fast the site appears on a phone" },
    accessibility: { name: "Accessibility", about: "whether anyone can use it, including people with poor eyesight" },
    qa: { name: "Working order", about: "whether the buttons, forms and links do what they should" },
    seo: { name: "Google (SEO)", about: "whether search engines understand the pages" },
    security: { name: "Security", about: "the basic protections the site asks for" },
  },
  colours: { rosu: "Red", galben: "Yellow", verde: "Green" },
  beforeWord: "before",
  afterWord: "after",

  scorecard: {
    heading: "Before and after, in numbers",
    intro: ({ before, after }) =>
      `I measured both versions on the same day, from the same computer, with the same tools: the weak version on ${before}, the fixed one on ${after}, Romanian time.`,
    measuredTwice: "I measured the fixed version twice; I explain why in the limits, at the end.",
    lighthouse:
      "The scores, LCP, CLS, TBT, page weight and delay come from Lighthouse, on a simulated phone. Each one is the median of three runs, the middle value.",
    termsHeading: "A few terms",
    terms: {
      lcp: "LCP (Largest Contentful Paint) is the time until the largest thing on the page, usually the top photo or heading, appears on screen.",
      cls: "CLS (Cumulative Layout Shift) shows how much parts of the page jump around while it loads; the closer to zero, the better.",
      tbt: "TBT (Total Blocking Time) is the time during loading when the page is too busy to respond if you tap it.",
      csp: "CSP (Content Security Policy) is a list sent to the browser of the places the page may load code, images and fonts from; anything else is blocked.",
    },
    rounding:
      "How I rounded: LCP in seconds, with one decimal; TBT in milliseconds, rounded to ten, as Lighthouse does; CLS with two decimals; page weight in MB with one decimal, and below one MB in whole kB. Each difference is worked out from the unrounded values and rounded the same way.",
    caption: "Before and after, for each page and for the whole site",
    cols: { what: "What I measured", before: "Before", after: "After", diff: "Difference" },
    pageGroup: ({ page }) => `${page} page`,
    siteGroup: "The whole site",
    lighthouseRows: {
      performance: "Speed score",
      accessibility: "Accessibility score",
      seo: "SEO score",
      bestPractices: "Best practices score",
      lcpMs: "LCP",
      cls: "CLS",
      tbtMs: "TBT",
      bytes: "Page weight",
      renderBlockingMs: "Delay from files that hold the display back (estimate)",
    },
    axeRow: "Problems found by axe, over every device",
    rows: {
      qa: "Playwright tests passed",
      observatoryGrade: "Mozilla HTTP Observatory grade",
      observatoryScore: "Mozilla HTTP Observatory score",
      headers: "Safety instructions sent to the browser (CSP and others)",
      exposed: "Source code files anyone can download",
      npmAudit: "Known problems in the build tools (npm audit)",
      seoChecks: "SEO checks passed, my own check of the page as Google receives it",
      linksChecked: "Addresses followed by linkinator",
      linksBroken: "Broken links found by linkinator",
    },
    notes: {
      seo: ({ id }) =>
        `Short of the top only because of the noindex request, which asks Google not to show the site, set on purpose (${id}).`,
      bestPractices: ({ id }) =>
        `Down only because, when measured, the site had no tab icon (favicon), and since ${id} its address correctly answered “not found”.`,
      observatoryScore: "Mozilla also gives bonus points, so the score can go above a hundred.",
      headersMissing: ({ names }) => `Missing: ${names}. See the limits at the end.`,
      seoChecks:
        "On each page: its own title, a description, a single main heading, Romanian as the language, the canonical address (the page's official address) and text in the page as received; plus the restaurant details on Home and Menu.",
      linkinator: "linkinator is a tool that automatically follows every link on a site and notes the broken ones.",
      linksChecked: ({ id }) => `On the weak version the pages arrived empty (${id}), so it had no links to follow.`,
      linksBroken: ({ id }) => `The broken footer link (${id}) was found only by the Playwright tests.`,
    },
    outOf: ({ a, b }) => `${a} of ${b}`,
    direction: { better: "better", worse: "worse", same: "same" },
  },

  findings: {
    heading: "What I found and what I fixed",
    intro: [
      "Each problem has a severity, the area and pages it affects, the evidence from the measurements, the fix and its status at the after run.",
      "Each fix is a commit, a saved and dated change in the code's public history. You can open every commit on GitHub.",
    ],
    rubricHeading: "How I rated severity",
    severity: { critica: "Critical", mare: "High", medie: "Medium", mica: "Low" },
    rubric: {
      critica: "A customer can't call, read the menu or book a table, or something exposes the site.",
      mare: "Affects many visitors, or Google can't read the page.",
      medie: "Slows down or gets in the way of some visitors.",
      mica: "Polish.",
    },
    status: { fixed: "Fixed", partly: "Partly fixed", "not-fixed": "Not fixed", "wont-fix": "Left on purpose" },
    labels: {
      severity: "Severity",
      area: "Area",
      pages: "Pages",
      allPages: "All pages",
      status: "Status after the new measurement",
      what: "What I found",
      why: "Why it matters",
      fix: "The fix",
      evidence: "Evidence",
      rawFiles: "Raw files",
      screenshots: "Screenshots of the failed tests, before",
      fixOnGitHub: "The fix, on GitHub",
      severalCommits: "The fix was made in several commits, in order:",
      wontFix: "Why I changed nothing",
    },
    commit: ({ sha }) => `Commit ${sha}`,
    run: { before: "Before", after: "After" },
    rawGroup: {
      lighthouse: ({ page }) => `Lighthouse, ${page}`,
      axe: ({ page }) => `axe, ${page}`,
      run: ({ n, run, group }) => `${group}, run ${n}, ${run}`,
      device: ({ device, run, group }) => `${group}, ${device}, ${run}`,
    },
    screenshot: ({ device }) => `Screenshot, ${device}`,
  },
  evidence: {
    page: { acasa: "Home", meniu: "Menu", rezervare: "Reservation" },
    device: { "iphone-15": "iPhone 15", "pixel-7": "Pixel 7", desktop: "computer" },
    missing: "missing",
    none: "none",
    yes: "yes",
    no: "no",
    failedTest: "Failed Playwright test",
    passesNow: "passes now",
    stillFails: "still fails",
    goneNow: "can no longer be downloaded",
    stillThere: "can still be downloaded",
    seo: {
      title: "Page title",
      description: "Description for Google",
      h1Count: "Main headings in the page as received",
      lang: "Declared language",
      canonical: "Canonical address",
      robots: "Request to Google (meta robots)",
      "jsonLd.types": "Structured data found",
      restaurantFieldsMissing: "Restaurant details missing",
      words: "Words in the page as received, before its program runs",
    },
    header: ({ name }) => `The ${name} instruction`,
    frameAncestors: "The CSP forbids showing the site inside other sites (frame-ancestors)",
    axeRules: "Rules broken, according to axe",
    axeViolations: "Problems found by axe",
    observatoryGrade: "Mozilla HTTP Observatory grade",
    observatoryScore: "Mozilla HTTP Observatory score",
    headersPresent: "Safety instructions sent",
    exposedPath: "Public source code file",
    exposedStatus: "The server's answer for that file",
    npmAudit: ({ level }) => `npm audit: ${level} problems`,
    npmLevels: { critical: "critical", high: "high", moderate: "moderate", low: "low" },
    linksChecked: "Addresses followed by linkinator",
    lighthouse: ({ metric }) => `${metric} (Lighthouse)`,
    axeRuleNames: {
      "image-alt": "photos without a text description",
      "color-contrast": "text too close in colour to its background",
      label: "fields without a label",
    },
    headerNames: {
      "content-security-policy": "CSP",
      "strict-transport-security": "HSTS, the instruction that makes the browser visit the site only over a secure connection",
      "x-content-type-options": "the instruction that stops the browser guessing file types",
      "x-frame-options": "the ban on being shown inside other sites",
      "referrer-policy": "the instruction on which address is passed on when someone clicks a link",
      "permissions-policy": "limits on access to the camera, microphone or location",
    },
  },

  planted: {
    heading: "What we planted and what was found",
    intro: ({ count }) =>
      `Before the first measurement, I wrote down the ${count} problems planted in the weak version. The list is public, and the code history shows it was written first.`,
    answerKey: "The list of planted problems, on GitHub",
    tools: {
      heading: "Caught by the automated tools",
      about: "Lighthouse, axe, my own check of the page as Google receives it, Mozilla HTTP Observatory and the check for public files.",
    },
    qaOnly: {
      heading: "Caught only by the Playwright tests",
      about:
        "The automated checking tools didn't see these. Only the tests I wrote, which use the site the way a visitor does, caught them. I did no manual checks.",
    },
    notCaught: {
      heading: "Not caught",
      about: "Planted problems that nothing found. I show them here rather than hide them.",
      empty: "None: every planted problem was found.",
    },
    unplanted: {
      heading: "Real problems nobody planted",
      about: "I found these during the audit, although they weren't on the list.",
    },
    notes: {
      axeMissed: ({ page, rules }) => `axe didn't flag it: on the ${page} page it found only ${rules}.`,
      placeholderName: "axe accepts the grey text inside a field as the field's name.",
      linkinatorMissed: ({ checked }) =>
        `linkinator followed only ${checked} addresses and found no broken link, because on the weak version the pages arrive empty.`,
    },
  },

  method: {
    heading: "How I measured, and the limits of this report",
    runsHeading: "The measurements",
    run: { before: "Before: the weak version", after: "After: the fixed version" },
    runLine: ({ date }) => `${date}, Romanian time`,
    deployed: ({ sha }) => `Code measured: ${sha}`,
    devicesHeading: "Devices",
    devices: [
      "Lighthouse: a simulated mid-range Android phone (Moto G Power), with its mobile connection and processor slowed down on purpose, Lighthouse's standard phone setting.",
      "Playwright and axe: iPhone 15 (through WebKit, Safari's engine), Pixel 7 (through Chromium, Chrome's engine) and a computer with Chrome.",
    ],
    toolsHeading: "Tools and versions",
    toolsSame: "The same for both measurements:",
    toolsPerRun: ({ run }) => `${run}:`,
    toolsOnline: [
      "Mozilla HTTP Observatory, the public online service",
      "npm audit, the check for known problems in the site's components",
    ],
    limitsHeading: "Limits",
    limits: {
      lab: "This is lab data, from tools, not from real visitors. On your customers' phones the figures may differ.",
      median:
        "Lighthouse gives slightly different results on every run, so I ran each page three times and show the median, the middle value.",
      noindex: ({ id }) =>
        `The noindex request, which asks Google not to show the site, is there on purpose, because this is a demo site (${id}). That is why Lighthouse's SEO score doesn't reach the top on the fixed site.`,
      manual:
        "I didn't do the manual checks: listening to the site with VoiceOver (the iPhone's screen reader), the Schema.org validator and Google's Rich Results Test. The automated results don't replace them.",
      iphone:
        "When I write “iPhone”, I mean Safari's engine (WebKit), run by Playwright on a computer with an iPhone's screen, not a real iPhone. I didn't test on real phones.",
      hsts:
        "I didn't assess HSTS, the instruction that makes the browser visit the site only over a secure connection: pages.dev addresses are already on the browsers' list of sites that only open securely.",
      activeSecurity:
        "I ran no active security tests, meaning attempted attacks, and no tests of the secure connection (TLS), which Cloudflare looks after. I only checked what the site sends and which files anyone can download.",
      notAudited:
        "The pages of this report are not part of the measurements. The link check doesn't enter them either, because the report links to the raw files of the run that was still being made.",
      measuredTwice: ({ score, firstRun, firstDate, id, sha, run }) =>
        `I measured the fixed version twice. The first run, ${firstRun}, made on ${firstDate}, Romanian time, right after the weak version's, gave a best practices score of ${score} on every page: since the first fix for ${id}, any address that doesn't exist got a real “page not found” answer, including /favicon.ico, the address of the tab icon, which was still missing, and the browser logged that as an error. The second fix for ${id}, commit ${sha}, added the icon, and the report uses the run made again after it, ${run}.`,
      measuredTwiceLink: "All the files of the first run, on GitHub",
    },
    psiHeading: "Check the speed yourself",
    psiAbout:
      "Google's PageSpeed Insights runs Lighthouse on Google's servers, so your figures will be slightly different from mine.",
    psiLink: ({ page }) => `${page}, in PageSpeed Insights`,
    rawHeading: "The raw data",
    rawAbout:
      "All the raw files of both measurements are published on this site and on GitHub. Each measurement's summary.json file is the source of every figure in this report.",
    rawSummary: ({ run }) => `summary.json, ${run}`,
    rawGitHub: ({ run }) => `All the files, ${run}, on GitHub`,
  },
};

export const copy: Record<Lang, ReportCopy> = { ro, en };

/** For tests: every string the copy can produce, with each template argument replaced by `arg`. */
export function allStrings(c: ReportCopy, arg = "X"): string[] {
  const args = new Proxy({}, { get: () => arg }) as P;
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") out.push(v);
    else if (typeof v === "function") out.push(String(v(args)));
    else if (v && typeof v === "object") for (const x of Object.values(v)) walk(x);
  };
  walk(c);
  return out;
}
