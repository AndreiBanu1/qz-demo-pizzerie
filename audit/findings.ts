// The audit findings, hand-written after the first run of the weak site and
// completed with the fixes and the same-session comparison run (audit/report-run.json).
// Each finding points at evidence keys in the report's before summary.json; the
// published report fails to build when validateFindings() returns anything.
import type { PageId, Summary } from "./summary-schema";
import { getEvidence } from "./evidence.mjs";

export type Severity = "critica" | "mare" | "medie" | "mica";
export type Area = "speed" | "accessibility" | "qa" | "seo" | "security";

export type Status = "fixed" | "partly" | "not-fixed" | "wont-fix";

type Copy = { title: string; what: string; why: string; fix: string };

export type Finding = {
  id: `F-${string}`;
  severity: Severity;
  area: Area;
  pages: PageId[] | "all";
  planted: `P-${string}` | null;
  /** getEvidence keys, at least one. */
  evidence: string[];
  /** Raw file names in the run dir, e.g. "lighthouse-meniu-2.json.gz". */
  evidenceFiles: string[];
  screenshots: string[];
  /** Decided by comparing the evidence in the before and after summaries. */
  status: Status;
  /** The commit that completes the fix (7 characters); null for a won't-fix. */
  fixCommit: string | null;
  /** Earlier commits that were part of the same fix. */
  alsoCommits?: string[];
  wontFix: { ro: string; en: string } | null;
  text: { ro: Copy; en: Copy };
};

// Evidence from the report's before run, audit/runs/2026-11-14-before. qa.failures.N
// and security.exposed.N index that run's summary.json; the test in findings.test.ts
// pins each one to its title. In the after summary they are matched by identity.
const LIGHTHOUSE_ALL = ["acasa", "meniu", "rezervare"].flatMap((p) => [1, 2, 3].map((n) => `lighthouse-${p}-${n}.json.gz`));
const AXE_ALL = ["acasa", "meniu", "rezervare"].flatMap((p) =>
  ["desktop", "iphone-15", "pixel-7"].map((d) => `axe-${p}-${d}.json.gz`),
);
const shot = (dir: string) => `${dir}/test-failed-1.png`;

export const findings: Finding[] = [
  {
    id: "F-01",
    severity: "critica",
    area: "qa",
    pages: ["rezervare"],
    planted: "P-07",
    evidence: ["qa.failures.21", "qa.failures.22", "qa.failures.33", "qa.failures.37"],
    evidenceFiles: ["playwright.json.gz"],
    screenshots: [
      shot("no-sideways-scroll-rezerva-382ba-ge-does-not-scroll-sideways-iphone-15"),
      shot("no-sideways-scroll-rezerva-382ba-ge-does-not-scroll-sideways-pixel-7"),
    ],
    status: "fixed",
    fixCommit: "29052df",
    wontFix: null,
    text: {
      ro: {
        title: "Pe telefon, formularul de rezervare iese din ecran",
        what: "Am deschis pagina de rezervare pe un iPhone și pe un telefon Android. Formularul are o lățime fixă, mai mare decât ecranul, așa că pagina fuge în lateral, iar butonul de trimitere rămâne în afara ecranului. În plus, textul din câmpuri e atât de mic încât iPhone-ul mărește singur pagina când atingi un câmp.",
        why: "Oamenii rezervă des de pe telefon, din mers. Dacă nu văd butonul de trimitere, nu termină rezervarea: pierzi masa, sau te sună doar cei mai răbdători.",
        fix: "Fac formularul cel mult cât ecranul, cu câmpurile unul sub altul pe telefon, și măresc textul din câmpuri până la mărimea la care iPhone-ul nu mai mărește pagina.",
      },
      en: {
        title: "On a phone, the reservation form runs off the screen",
        what: "I opened the reservation page on an iPhone and on an Android phone. The form has a fixed width, wider than the screen, so the page slides sideways and the submit button stays off screen. On top of that, the text in the fields is so small that the iPhone zooms the page in by itself when you tap a field.",
        why: "People often book from their phone, on the go. If they can't see the submit button, they don't finish the booking: you lose the table, or only the most patient ones call you.",
        fix: "I make the form no wider than the screen, with the fields stacked on a phone, and I enlarge the text in the fields to the size at which the iPhone no longer zooms in.",
      },
    },
  },
  {
    id: "F-02",
    severity: "critica",
    area: "accessibility",
    pages: ["acasa"],
    planted: "P-06",
    evidence: ["qa.failures.9", "qa.failures.10", "qa.failures.11", "qa.failures.44"],
    evidenceFiles: ["playwright.json.gz"],
    screenshots: [
      shot("call-the-call-control-is-a-tel-link-iphone-15"),
      shot("keyboard-Tab-reaches-the-c-e813b-e-page-with-a-visible-focus-desktop"),
    ],
    status: "fixed",
    fixCommit: "f9d1662",
    wontFix: null,
    text: {
      ro: {
        title: "Butonul „Sună acum” nu e un link de telefon adevărat",
        what: "Butonul „Sună acum” arată ca un buton, dar în spate nu e un link de telefon. Am căutat pe pagină un link de telefon cu acest text și nu există, pe niciunul dintre cele trei dispozitive. Am încercat apoi cu tasta Tab, cum navighează cei care nu folosesc mouse-ul sau degetul: nu ajungi niciodată la el.",
        why: "Telefonul e cel mai scurt drum de la un client flămând la o comandă. Cine navighează doar cu tastatura nu te poate suna deloc din site.",
        fix: "Transform butonul într-un link de telefon adevărat, care merge cu degetul, cu mouse-ul și cu tastatura și care se vede clar când e selectat.",
      },
      en: {
        title: "The “Sună acum” (Call now) button isn't a real phone link",
        what: "The “Sună acum” button looks like a button, but behind it there is no phone link. I looked for a phone link with this text on the page and there isn't one, on any of the three devices. I then tried the Tab key, the way people who don't use a mouse or a finger get around: you never reach it.",
        why: "The phone is the shortest path from a hungry customer to an order. Someone who gets around with the keyboard alone can't call you from the site at all.",
        fix: "I turn the button into a real phone link that works with a finger, a mouse and the keyboard, and that is clearly visible when selected.",
      },
    },
  },
  {
    id: "F-03",
    severity: "mare",
    area: "seo",
    pages: "all",
    planted: "P-10",
    evidence: [
      "pages.acasa.seo.words",
      "pages.meniu.seo.words",
      "pages.rezervare.seo.words",
      "pages.acasa.seo.h1Count",
      "pages.meniu.seo.h1Count",
      "pages.rezervare.seo.h1Count",
      "links.checked",
    ],
    evidenceFiles: ["seo-html.json.gz", "links.json.gz"],
    screenshots: [],
    status: "fixed",
    fixCommit: "1c4e456",
    wontFix: null,
    text: {
      ro: {
        title: "Google primește pagini goale",
        what: "Am citit paginile așa cum le primește întâi un motor de căutare, înainte să ruleze programul din pagină. Pe toate trei paginile am găsit 0 cuvinte și niciun titlu principal. Tot conținutul apare abia după ce telefonul sau calculatorul vizitatorului construiește singur pagina. Din același motiv, unealta mea care urmărește linkurile n-a găsit niciun link spre meniu sau spre rezervare.",
        why: "Google se descurcă uneori cu astfel de pagini, dar mai încet și nu întotdeauna. Alte motoare de căutare și asistenții cu inteligență artificială văd adesea doar pagina goală. Dacă nu îți văd meniul și programul, nu te pot recomanda celor care caută o pizzerie.",
        fix: "Construiesc paginile dinainte, la publicare, astfel încât fiecare adresă să trimită direct textul complet: numele, meniul, programul și adresa.",
      },
      en: {
        title: "Google receives empty pages",
        what: "I read the pages the way a search engine first receives them, before the page's program runs. On all three pages I found 0 words and no main heading. All the content appears only after the visitor's phone or computer builds the page itself. For the same reason, my link-following tool found no link to the menu or to the reservation page.",
        why: "Google sometimes copes with pages like these, but more slowly and not always. Other search engines and AI assistants often see only the empty page. If they can't see your menu and your hours, they can't recommend you to people looking for a pizzeria.",
        fix: "I build the pages ahead of time, at publish time, so that every address sends the full text straight away: the name, the menu, the hours and the address.",
      },
    },
  },
  {
    id: "F-04",
    severity: "mare",
    area: "speed",
    pages: ["acasa", "meniu"],
    planted: "P-01",
    evidence: [
      "pages.acasa.lighthouse.lcpMs",
      "pages.acasa.lighthouse.performance",
      "pages.acasa.lighthouse.cls",
      "pages.acasa.lighthouse.bytes",
      "pages.meniu.lighthouse.bytes",
    ],
    evidenceFiles: LIGHTHOUSE_ALL.filter((f) => !f.includes("rezervare")),
    screenshots: [],
    status: "fixed",
    fixCommit: "4dbedc2",
    wontFix: null,
    text: {
      ro: {
        title: "Pozele sunt uriașe și încetinesc site-ul pe telefon",
        what: "Pozele de pe prima pagină și din meniu sunt la mărimea originală din aparatul foto, mult mai mari decât locul în care apar. Pe un telefon simulat, cu internet mobil obișnuit, poza mare de pe prima pagină a apărut abia după circa 15 secunde, iar pagina de meniu descarcă aproximativ 23 MB. În plus, poza de sus nu are dimensiunile declarate, așa că textul de sub ea sare în jos când se încarcă.",
        why: "Cine caută o pizzerie pe telefon nu așteaptă. Mulți închid pagina înainte să vadă ceva, iar cei cu abonament limitat își consumă datele mobile pe pozele tale.",
        fix: "Micșorez fiecare poză la mărimea la care e afișată, o salvez într-un format modern și mai ușor, îi declar dimensiunile și las pozele din josul paginii să se încarce doar când ajungi la ele.",
      },
      en: {
        title: "The photos are huge and slow the site down on a phone",
        what: "The photos on the home page and in the menu are at the camera's original size, much larger than the space they fill. On a simulated phone with an ordinary mobile connection, the large home-page photo appeared only after about 15 seconds, and the menu page downloads about 23 MB. On top of that, the top photo has no declared size, so the text below it jumps down when it loads.",
        why: "People looking for a pizzeria on their phone don't wait. Many close the page before they see anything, and those on a limited plan use up their mobile data on your photos.",
        fix: "I shrink each photo to the size it's shown at, save it in a modern, lighter format, declare its size, and let the photos lower down the page load only when you get to them.",
      },
    },
  },
  {
    id: "F-05",
    severity: "mare",
    area: "qa",
    pages: ["acasa"],
    planted: "P-08",
    evidence: [
      "qa.failures.26",
      "qa.failures.27",
      "qa.failures.28",
      "qa.failures.29",
      "qa.failures.30",
      "qa.failures.31",
    ],
    evidenceFiles: ["playwright.json.gz"],
    screenshots: [
      shot("opening-status-at-2026-11--ce814--Deschis-acum-până-la-22-00-desktop"),
      shot("opening-status-at-2026-11--14e31-is-deschidem-mâine-la-11-00-desktop"),
    ],
    status: "fixed",
    fixCommit: "cdf8567",
    wontFix: null,
    text: {
      ro: {
        title: "Mesajul „Deschis acum” greșește câteva ore pe zi",
        what: "Prima pagină îi spune vizitatorului dacă pizzeria e deschisă. Am fixat ceasul la ore cunoscute, după ora României. Într-o marți înainte de prânz, când pizzeria era deschisă, pagina scria „Închis”. Într-o vineri noaptea, după închidere, scria „Deschis acum”. Calculul folosește ora universală (ora Londrei iarna), nu ora României, așa că mesajul greșește în fiecare zi, în jurul deschiderii și al închiderii.",
        why: "Un client care vede „Închis” nu mai vine și nu mai sună, deși tu îl aștepți. Unul care vede „Deschis” după închidere vine degeaba și pleacă supărat.",
        fix: "Calculez programul după ora României, inclusiv la trecerea la ora de vară și la ora de iarnă, și verific automat câteva ore-limită.",
      },
      en: {
        title: "The “Deschis acum” (Open now) message is wrong for a few hours a day",
        what: "The home page tells visitors whether the pizzeria is open. I set the clock to known times, in Romanian time. On a Tuesday before lunch, while the pizzeria was open, the page said “Închis” (Closed). On a Friday night, after closing, it said “Deschis acum” (Open now). The calculation uses universal time (London's winter time), not Romanian time, so the message is wrong every day around opening and closing.",
        why: "A customer who sees “Closed” doesn't come and doesn't call, even though you're expecting them. One who sees “Open” after closing comes for nothing and leaves annoyed.",
        fix: "I calculate the hours in Romanian time, including the switch to summer and winter time, and I check a few edge times automatically.",
      },
    },
  },
  {
    id: "F-06",
    severity: "mare",
    area: "seo",
    pages: "all",
    planted: "P-09",
    evidence: [
      "pages.acasa.seo.title",
      "pages.meniu.seo.title",
      "pages.rezervare.seo.title",
      "pages.acasa.seo.description",
      "pages.meniu.seo.description",
      "pages.rezervare.seo.description",
      "pages.acasa.lighthouse.seo",
    ],
    evidenceFiles: ["seo-html.json.gz", ...LIGHTHOUSE_ALL],
    screenshots: [],
    status: "fixed",
    fixCommit: "230765b",
    wontFix: null,
    text: {
      ro: {
        title: "Toate paginile se numesc „Home” și nu au descriere",
        what: "Titlul fiecărei pagini, cel care apare ca link albastru în Google și pe fila din browser, e „Home”, în engleză, pe toate trei paginile. Niciuna nu are descrierea scurtă care apare sub link în rezultatele căutării.",
        why: "În Google, oamenii aleg pe ce dau clic după titlu și descriere. „Home” nu spune cine ești, ce gătești și unde ești. Fără descriere, Google alege singur un text din pagină, de multe ori nepotrivit.",
        fix: "Dau fiecărei pagini un titlu propriu, cu numele pizzeriei și orașul, și o descriere scurtă, scrisă pentru oameni.",
      },
      en: {
        title: "Every page is called “Home” and has no description",
        what: "The title of each page, the one that shows as the blue link in Google and on the browser tab, is “Home”, in English, on all three pages. None of them has the short description that appears under the link in search results.",
        why: "In Google, people choose what to click by the title and the description. “Home” doesn't say who you are, what you cook or where you are. Without a description, Google picks some text from the page by itself, often a poor fit.",
        fix: "I give each page its own title, with the pizzeria's name and the town, and a short description written for people.",
      },
    },
  },
  {
    id: "F-07",
    severity: "mare",
    area: "seo",
    pages: "all",
    planted: null,
    evidence: [
      "pages.acasa.headers.x-robots-tag",
      "pages.meniu.headers.x-robots-tag",
      "pages.rezervare.headers.x-robots-tag",
      "pages.acasa.seo.robots",
      "pages.meniu.seo.robots",
      "pages.rezervare.seo.robots",
    ],
    evidenceFiles: ["headers.json.gz", "seo-html.json.gz", ...LIGHTHOUSE_ALL],
    screenshots: [],
    status: "wont-fix",
    fixCommit: null,
    wontFix: {
      ro: "Intenționat: acesta e un site demonstrativ și nu trebuie să apară în Google. Pe un site real, ar ascunde site-ul din Google, așa că aș scoate aceste semnale înainte de lansare.",
      en: "Intentional: this is a demonstration site and must not appear in Google. On a real site it would hide the site from Google, so I would remove these signals before launch.",
    },
    text: {
      ro: {
        title: "Google e rugat să nu afișeze site-ul (intenționat)",
        what: "Fiecare pagină îi cere lui Google, în două locuri, să nu o afișeze în rezultatele căutării. Am pus asta acolo intenționat.",
        why: "Pe site-ul unui restaurant adevărat, asta ar ascunde site-ul de Google: nimeni nu te-ar găsi acolo. Aici e un site demonstrativ, cu telefon și adresă inventate, așa că nu are ce căuta în rezultatele căutării.",
        fix: "Pe acest site nu schimb nimic. Pe un site real aș scoate ambele semnale înainte de lansare și aș verifica apoi că Google poate afișa paginile.",
      },
      en: {
        title: "Google is asked not to show the site (on purpose)",
        what: "Every page asks Google, in two places, not to show it in search results. I put that there on purpose.",
        why: "On a real restaurant's site this would hide the site from Google: nobody would find you there. This is a demonstration site with a made-up phone number and address, so it has no business appearing in search results.",
        fix: "I change nothing on this site. On a real site I would remove both signals before launch and then check that Google can show the pages.",
      },
    },
  },
  {
    id: "F-08",
    severity: "medie",
    area: "accessibility",
    pages: ["meniu"],
    planted: "P-04",
    evidence: ["pages.meniu.axe.rules", "pages.meniu.lighthouse.accessibility", "qa.failures.1", "qa.failures.4", "qa.failures.7"],
    evidenceFiles: ["axe-meniu-desktop.json.gz", "axe-meniu-iphone-15.json.gz", "axe-meniu-pixel-7.json.gz"],
    screenshots: [shot("axe-meniu-no-accessibility-violations-iphone-15")],
    status: "fixed",
    fixCommit: "240e15f",
    wontFix: null,
    text: {
      ro: {
        title: "Prețurile din meniu abia se văd",
        what: "Prețurile sunt scrise cu gri foarte deschis pe fundal alb. Verificarea automată de accesibilitate (cât de ușor poate folosi site-ul oricine, inclusiv cine vede slab) le-a marcat ca greu de citit pe toate trei dispozitivele testate.",
        why: "Prețul e unul dintre primele lucruri pe care le caută un client în meniu. Cine vede slab, sau citește pe telefon în soare, nu îl deslușește și poate pleca fără să comande.",
        fix: "Scriu prețurile într-o culoare închisă, destul de diferită de fundal ca să poată fi citite ușor de oricine.",
      },
      en: {
        title: "The menu prices are barely visible",
        what: "The prices are written in very light grey on a white background. The automated accessibility check (how easily anyone can use the site, including people with poor eyesight) flagged them as hard to read on all three devices tested.",
        why: "The price is one of the first things a customer looks for in a menu. Someone with poor eyesight, or reading on a phone in the sun, can't make it out and may leave without ordering.",
        fix: "I write the prices in a dark colour, different enough from the background that anyone can read them easily.",
      },
    },
  },
  {
    id: "F-09",
    severity: "medie",
    area: "accessibility",
    pages: ["rezervare"],
    planted: "P-05",
    evidence: [
      "qa.failures.32",
      "qa.failures.36",
      "qa.failures.40",
      "qa.failures.34",
      "qa.failures.38",
      "qa.failures.42",
    ],
    evidenceFiles: ["playwright.json.gz"],
    screenshots: [shot("reservation-every-field-has-a-label-iphone-15")],
    status: "fixed",
    fixCommit: "1764670",
    wontFix: null,
    text: {
      ro: {
        title: "Câmpurile din formularul de rezervare nu au etichete",
        what: "Fiecare câmp are doar un text gri de ajutor în interior (de exemplu „Nume”), care dispare când începi să scrii. Nu există o etichetă propriu-zisă legată de câmp. Din acest motiv, testele mele automate n-au putut găsi câmpurile după nume și n-au putut completa formularul deloc.",
        why: "Cine a început să scrie și se uită înapoi nu mai știe ce câmp completează. Programele care citesc ecranul cu voce tare pentru nevăzători și comenzile vocale se bazează pe aceste etichete. Fiecare rezervare abandonată e o masă goală.",
        fix: "Adaug o etichetă vizibilă deasupra fiecărui câmp, legată corect de el, și păstrez textul gri doar ca exemplu.",
      },
      en: {
        title: "The reservation form fields have no labels",
        what: "Each field has only a grey hint inside it (for example “Nume”, Name), which disappears when you start typing. There is no real label tied to the field. Because of that, my automated tests couldn't find the fields by name and couldn't fill in the form at all.",
        why: "Someone who has started typing and looks back no longer knows which field they're filling in. Programs that read the screen aloud for blind people, and voice commands, rely on these labels. Every abandoned booking is an empty table.",
        fix: "I add a visible label above each field, tied to it properly, and keep the grey text only as an example.",
      },
    },
  },
  {
    id: "F-10",
    severity: "medie",
    area: "accessibility",
    pages: "all",
    planted: "P-03",
    evidence: [
      "pages.acasa.axe.rules",
      "pages.meniu.axe.rules",
      "pages.rezervare.axe.rules",
      "pages.acasa.lighthouse.accessibility",
      "qa.failures.0",
      "qa.failures.2",
    ],
    evidenceFiles: [...AXE_ALL, ...LIGHTHOUSE_ALL],
    screenshots: [shot("axe-acasa-no-accessibility-violations-iphone-15")],
    status: "fixed",
    fixCommit: "fc075ab",
    wontFix: null,
    text: {
      ro: {
        title: "Pozele și logo-ul nu au descriere text",
        what: "Pozele din meniu, poza de pe prima pagină și logo-ul nu au text alternativ, adică descrierea scurtă pe care o citesc cu voce tare programele pentru nevăzători. Am găsit problema pe toate trei paginile.",
        why: "Un client nevăzător nu află ce e în poze: nici ce pizza vede, nici al cui e logo-ul. Google folosește și el aceste descrieri ca să înțeleagă pozele.",
        fix: "Scriu o descriere scurtă pentru fiecare poză (de exemplu „Pizza Margherita cu busuioc proaspăt”) și dau logo-ului numele pizzeriei.",
      },
      en: {
        title: "The photos and the logo have no text description",
        what: "The menu photos, the home-page photo and the logo have no alternative text, the short description that programs for blind people read aloud. I found the problem on all three pages.",
        why: "A blind customer doesn't learn what's in the photos: neither which pizza it is nor whose logo it is. Google also uses these descriptions to understand the photos.",
        fix: "I write a short description for each photo (for example “Pizza Margherita with fresh basil”) and give the logo the pizzeria's name.",
      },
    },
  },
  {
    id: "F-11",
    severity: "medie",
    area: "qa",
    pages: "all",
    planted: "P-15",
    evidence: [
      "qa.failures.12",
      "qa.failures.13",
      "qa.failures.14",
      "qa.failures.15",
      "qa.failures.16",
      "qa.failures.17",
      "qa.failures.18",
      "qa.failures.19",
      "qa.failures.20",
    ],
    evidenceFiles: ["playwright.json.gz"],
    screenshots: [shot("links-meniu-every-internal-link-leads-to-a-real-page-desktop")],
    status: "fixed",
    fixCommit: "6e5d978",
    wontFix: null,
    text: {
      ro: {
        title: "Linkul „Meniu” din josul paginii duce la o pagină inexistentă",
        what: "În partea de jos a fiecărei pagini, linkul „Meniu” duce la o adresă greșită, iar vizitatorul ajunge pe pagina „Pagina nu există”. Am deschis fiecare link de pe cele trei pagini, pe trei dispozitive, și doar acesta e stricat.",
        why: "Cine a citit până jos și vrea meniul dă de o eroare. Unii renunță acolo, deși erau gata să comande.",
        fix: "Corectez adresa linkului și păstrez o verificare automată care deschide toate linkurile interne după fiecare schimbare.",
      },
      en: {
        title: "The “Meniu” (Menu) link at the bottom of the page leads to a page that doesn't exist",
        what: "At the bottom of every page, the “Meniu” link goes to a wrong address, and the visitor lands on the “Pagina nu există” (Page doesn't exist) page. I opened every link on the three pages, on three devices, and only this one is broken.",
        why: "Someone who read to the bottom and wants the menu runs into an error. Some give up there, even though they were ready to order.",
        fix: "I correct the link's address and keep an automated check that opens every internal link after each change.",
      },
    },
  },
  {
    id: "F-12",
    severity: "medie",
    area: "speed",
    pages: "all",
    planted: "P-02",
    evidence: [
      "pages.acasa.lighthouse.renderBlockingMs",
      "pages.meniu.lighthouse.renderBlockingMs",
      "pages.rezervare.lighthouse.renderBlockingMs",
    ],
    evidenceFiles: LIGHTHOUSE_ALL,
    screenshots: [],
    status: "fixed",
    fixCommit: "bd762f8",
    wontFix: null,
    text: {
      ro: {
        title: "Fontul titlurilor ține pagina pe loc până se descarcă",
        what: "Fontul titlurilor vine de la Google Fonts cu toate grosimile și variantele înclinate, deși site-ul folosește doar câteva. Browserul așteaptă să-l descarce înainte să arate ceva pe ecran. Pe un telefon simulat, testul de viteză estimează că, fără fișierele care țin pagina pe loc, fiecare pagină ar apărea cu 814 până la 835 de milisecunde mai devreme, adică aproape o secundă. Fontul e cel mai lent dintre aceste fișiere.",
        why: "Fiecare clipă de ecran gol face site-ul să pară lent, mai ales pe telefon, cu semnal slab.",
        fix: "Găzduiesc fontul pe același server cu site-ul, doar cu grosimile folosite, și las textul să apară imediat, urmând ca fontul să se aplice când e gata.",
      },
      en: {
        title: "The heading font holds the page back until it downloads",
        what: "The heading font comes from Google Fonts with every weight and italic variant, although the site uses only a few. The browser waits to download it before showing anything on screen. On a simulated phone, the speed test estimates that without the files holding the page back, each page would appear 814 to 835 milliseconds sooner, almost a second. The font is the slowest of those files.",
        why: "Every moment of blank screen makes the site feel slow, especially on a phone with a weak signal.",
        fix: "I host the font on the same server as the site, with only the weights in use, and let the text appear straight away, with the font applied once it's ready.",
      },
    },
  },
  {
    id: "F-13",
    severity: "medie",
    area: "seo",
    pages: "all",
    planted: "P-11",
    evidence: [
      "pages.acasa.seo.jsonLd.types",
      "pages.meniu.seo.jsonLd.types",
      "pages.rezervare.seo.jsonLd.types",
      "pages.acasa.seo.restaurantFieldsMissing",
    ],
    evidenceFiles: ["seo-html.json.gz"],
    screenshots: [],
    status: "fixed",
    fixCommit: "e2a4b02",
    wontFix: null,
    text: {
      ro: {
        title: "Google nu primește datele pizzeriei într-o formă pe care o înțelege direct",
        what: "Pe nicio pagină nu există date structurate, adică un bloc ascuns, într-un format standard, care îi spune direct lui Google numele, adresa, telefonul, programul, meniul și prețurile. Am căutat fiecare informație pe care o aștept pentru un restaurant și lipsesc toate.",
        why: "Fără aceste date, Google trebuie să ghicească programul și adresa din text, iar aici nici textul nu e în pagină. Ratezi șansa ca programul și meniul tău să apară direct în rezultatele căutării.",
        fix: "Adaug datele structurate pentru restaurant, cu aceleași informații ca pe pagină, și verific automat că pagina primită, înainte să ruleze programul ei, le conține pe toate. Validatorul Schema.org și testul Rich Results de la Google se pot folosi în plus, ca verificare manuală.",
      },
      en: {
        title: "Google doesn't get the pizzeria's details in a form it understands directly",
        what: "No page has structured data, a hidden block in a standard format that tells Google directly the name, address, phone, hours, menu and prices. I looked for every detail I expect for a restaurant and they are all missing.",
        why: "Without this data Google has to guess the hours and address from the text, and here even the text isn't in the page. You miss the chance for your hours and menu to show up right in the search results.",
        fix: "I add structured data for the restaurant, with the same details as on the page, and check automatically that the page as first received, before its program runs, contains all of them. The Schema.org validator and Google's Rich Results Test can be used on top, as a manual check.",
      },
    },
  },
  {
    id: "F-14",
    severity: "medie",
    area: "seo",
    pages: "all",
    planted: "P-12",
    evidence: ["pages.acasa.seo.lang", "pages.meniu.seo.lang", "pages.rezervare.seo.lang"],
    evidenceFiles: ["seo-html.json.gz"],
    screenshots: [],
    status: "fixed",
    fixCommit: "dc0873c",
    wontFix: null,
    text: {
      ro: {
        title: "Site-ul declară că e scris în engleză",
        what: "Codul fiecărei pagini anunță limba engleză, deși tot textul e în română.",
        why: "Programele care citesc ecranul cu voce tare pentru nevăzători folosesc atunci pronunția englezească, iar textul devine greu de înțeles. Browserul poate propune traducerea paginii „din engleză”, iar Google primește un semnal greșit despre cui te adresezi.",
        fix: "Declar limba română pe fiecare pagină.",
      },
      en: {
        title: "The site says it's written in English",
        what: "The code of every page announces English, although all the text is in Romanian.",
        why: "Programs that read the screen aloud for blind people then use English pronunciation, and the text becomes hard to follow. The browser may offer to translate the page “from English”, and Google gets the wrong signal about who you're speaking to.",
        fix: "I declare Romanian as the language on every page.",
      },
    },
  },
  {
    id: "F-15",
    severity: "medie",
    area: "security",
    pages: "all",
    planted: "P-13",
    evidence: [
      "security.observatory.grade",
      "security.observatory.score",
      "security.headersPresent",
      "pages.acasa.headers.content-security-policy",
      "pages.acasa.headers.x-frame-options",
      "pages.acasa.headers.frameAncestors",
      "pages.acasa.headers.permissions-policy",
    ],
    evidenceFiles: ["observatory.json.gz", "headers.json.gz"],
    screenshots: [],
    status: "fixed",
    fixCommit: "bcb0a0f",
    alsoCommits: ["a32b3db"],
    wontFix: null,
    text: {
      ro: {
        title: "Lipsesc protecțiile de bază pe care site-ul le poate cere browserului",
        what: "Am verificat ce instrucțiuni de siguranță trimite site-ul browserului odată cu fiecare pagină. Lipsesc trei importante: politica de conținut (CSP, o listă cu locurile din care pagina are voie să încarce cod), interdicția de a fi afișat în interiorul altor site-uri și limitarea accesului la cameră, microfon sau locație. Mozilla HTTP Observatory, un test public de securitate, a dat site-ului nota C, cu 55 de puncte.",
        why: "Fără ele, un site străin ar putea afișa pagina ta în interiorul lui ca să-ți păcălească vizitatorii, iar dacă cineva ar reuși vreodată să strecoare cod străin în site, browserul nu l-ar opri. Pe acest site riscul e mic, pentru că nu cere și nu trimite date, dar protecțiile costă puțin și sunt standard.",
        fix: "Adaug aceste instrucțiuni în setările serverului, verific că nu blochează nimic din site și refac testul Mozilla.",
      },
      en: {
        title: "The basic protections a site can ask the browser for are missing",
        what: "I checked which safety instructions the site sends the browser along with each page. Three important ones are missing: the content policy (CSP, a list of the places the page is allowed to load code from), the ban on being shown inside other sites, and limits on access to the camera, microphone or location. Mozilla HTTP Observatory, a public security test, gave the site a C grade, with 55 points.",
        why: "Without them, a foreign site could show your page inside itself to trick your visitors, and if someone ever managed to slip foreign code into the site, the browser wouldn't stop it. On this site the risk is low, because it neither asks for nor sends any data, but these protections cost little and are standard.",
        fix: "I add these instructions to the server settings, check that they don't block anything on the site, and run the Mozilla test again.",
      },
    },
  },
  {
    id: "F-16",
    severity: "medie",
    area: "security",
    pages: "all",
    planted: "P-14",
    evidence: ["security.exposed.0.path", "security.exposed.0.status"],
    evidenceFiles: ["exposure.json.gz"],
    screenshots: [],
    status: "fixed",
    fixCommit: "f283a36",
    wontFix: null,
    text: {
      ro: {
        title: "Codul sursă original al site-ului e public",
        what: "Odată cu site-ul e publicată și o hartă a codului (source map, un fișier care reface codul sursă original, cu tot cu comentariile din el). Oricine o poate descărca.",
        why: "Codul acestui site nu conține parole sau chei, deci nu se scurge nimic secret. Totuși, îi arată oricui cum e construit site-ul și îi ușurează căutarea de puncte slabe, fără niciun folos pentru clienții tăi.",
        fix: "Opresc publicarea acestor fișiere când construiesc site-ul și verific că adresa lor nu mai răspunde.",
      },
      en: {
        title: "The site's original source code is public",
        what: "Along with the site, a code map is published (a source map, a file that rebuilds the original source code, comments included). Anyone can download it.",
        why: "This site's code holds no passwords or keys, so nothing secret leaks. Still, it shows anyone how the site is built and makes it easier to look for weak spots, with no benefit to your customers.",
        fix: "I stop publishing these files when I build the site and check that their address no longer answers.",
      },
    },
  },
  {
    id: "F-17",
    severity: "mica",
    area: "seo",
    pages: "all",
    planted: null,
    evidence: ["qa.failures.23", "qa.failures.24", "qa.failures.25"],
    evidenceFiles: ["playwright.json.gz", "exposure.json.gz"],
    screenshots: [shot("not-found-an-unknown-addre-3c449-404-and-offers-the-way-home-desktop")],
    status: "fixed",
    fixCommit: "d4b55c7",
    alsoCommits: ["2ac9cf1"],
    wontFix: null,
    text: {
      ro: {
        title: "Adresele care nu există răspund ca și cum ar exista",
        what: "Am deschis o adresă inventată pe site. Vizitatorul vede pagina „Pagina nu există”, cu drumul înapoi spre prima pagină, dar serverul le spune browserului și lui Google că pagina există și că totul e în regulă, în loc să spună că lipsește.",
        why: "Google poate păstra adrese greșite drept pagini reale ale site-ului tău, toate cu același mesaj de eroare, și își pierde timpul cu ele în loc să citească paginile care contează.",
        fix: "Configurez serverul să răspundă „pagină inexistentă” la orice adresă necunoscută, păstrând pagina prietenoasă, cu drumul înapoi spre prima pagină.",
      },
      en: {
        title: "Addresses that don't exist answer as if they did",
        what: "I opened a made-up address on the site. The visitor sees the “Pagina nu există” (Page doesn't exist) page, with the way back to the home page, but the server tells the browser and Google that the page exists and all is well, instead of saying it's missing.",
        why: "Google may keep wrong addresses as real pages of your site, all with the same error message, and waste its time on them instead of reading the pages that matter.",
        fix: "I set the server to answer “page not found” for any unknown address, keeping the friendly page with the way back to the home page.",
      },
    },
  },
  {
    id: "F-18",
    severity: "mica",
    area: "security",
    pages: "all",
    planted: null,
    evidence: [
      "security.npmAudit.critical",
      "security.npmAudit.high",
      "security.npmAudit.moderate",
      "security.npmAudit.low",
    ],
    evidenceFiles: ["npm-audit.json.gz"],
    screenshots: [],
    status: "fixed",
    fixCommit: "d6e2aa9",
    wontFix: null,
    text: {
      ro: {
        title: "Unele unelte cu care construiesc site-ul au probleme de securitate cunoscute",
        what: "Am trecut lista de componente a site-ului prin npm audit, o verificare automată a problemelor de securitate cunoscute. A găsit 2 probleme marcate critice, 1 gravă și 3 moderate. Toate sunt în uneltele de test și de construire (Vite și Vitest), care rulează doar când lucrez la site, nu în paginile pe care le primește vizitatorul.",
        why: "Clienții tăi nu sunt expuși, pentru că aceste unelte nu ajung în site. Riscul privește calculatorul celui care lucrează la site, iar uneltele rămase în urmă devin tot mai greu de actualizat.",
        fix: "Reparațiile cer versiuni majore noi ale uneltelor de construire (Vite și Vitest), adică o schimbare mai mare decât o simplă actualizare. Le actualizez, verific că site-ul se construiește la fel și rulez din nou verificarea.",
      },
      en: {
        title: "Some of the tools I build the site with have known security problems",
        what: "I ran the site's list of components through npm audit, an automated check for known security problems. It found 2 problems marked critical, 1 high and 3 moderate. All of them are in the testing and build tools (Vite and Vitest), which run only while I work on the site, not in the pages a visitor receives.",
        why: "Your customers aren't exposed, because these tools never reach the site. The risk is to the computer of whoever works on the site, and tools left behind get harder and harder to update.",
        fix: "The fixes need new major versions of the build tools (Vite and Vitest), a bigger change than a simple update. I upgrade them, check that the site still builds the same way, and run the check again.",
      },
    },
  },
];

const SEVERITIES: readonly string[] = ["critica", "mare", "medie", "mica"];
const STATUSES: readonly string[] = ["fixed", "partly", "not-fixed", "wont-fix"];
const ID_PATTERN = /^F-\d{2}$/;
const CEDILLA = /[şţŞŢ]/;
const COPY_FIELDS = ["title", "what", "why", "fix"] as const;
/** Keys that index into a list; they only resolve in the before summary and are matched by identity in the after one. */
const INDEX_KEY = /^(qa\.failures|security\.exposed)\.(\d+)(?:\.[A-Za-z]+)?$/;

export function isIndexKey(key: string): boolean {
  return INDEX_KEY.test(key);
}

/** The identity of the list item an index key points at: title + project for a QA failure, path for an exposure. null when it can't be resolved. */
export function indexIdentity(summary: Summary, key: string): string | null {
  const m = INDEX_KEY.exec(key);
  if (!m) return null;
  let item: unknown;
  try {
    item = getEvidence(summary, `${m[1]}.${m[2]}`);
  } catch {
    return null;
  }
  const rec = item as Record<string, unknown> | null;
  if (m[1] === "qa.failures") {
    return typeof rec?.title === "string" && typeof rec?.project === "string" ? `${rec.title} @ ${rec.project}` : null;
  }
  return typeof rec?.path === "string" ? rec.path : null;
}

/** True when the item an index key points at in `before` is still listed in `after` (the problem is still there). */
export function stillPresentInAfter(before: Summary, after: Summary, key: string): boolean {
  const identity = indexIdentity(before, key);
  if (identity === null) return false;
  if (key.startsWith("qa.failures.")) return after.qa.failures.some((f) => `${f.title} @ ${f.project}` === identity);
  return after.security.exposed.some((e) => e.path === identity);
}

/**
 * Returns one message per problem, each containing the finding id. [] means valid.
 * With `after`, scalar evidence keys must also resolve in the after summary (index keys are matched by identity instead).
 */
export function validateFindings(findings: Finding[], before: Summary, planted: { id: string }[], after?: Summary): string[] {
  const out: string[] = [];
  const plantedIds = new Set(planted.map((p) => p.id));
  const seen = new Set<string>();

  for (const f of findings) {
    const id = f.id;
    if (!ID_PATTERN.test(id)) out.push(`${id}: id must match F-NN (two digits)`);
    if (seen.has(id)) out.push(`${id}: duplicate id`);
    seen.add(id);

    if (!SEVERITIES.includes(f.severity)) out.push(`${id}: invalid severity "${f.severity}"`);
    if (!STATUSES.includes(f.status)) out.push(`${id}: invalid status "${f.status}"`);
    if (f.status === "wont-fix" && f.wontFix === null) out.push(`${id}: status wont-fix needs a wontFix explanation`);
    if (f.wontFix !== null && f.status !== "wont-fix") out.push(`${id}: has a wontFix explanation but status is "${f.status}"`);

    // R9: a fix commit, or an explicit won't-fix, or an honest "not-fixed".
    if (f.fixCommit === null && f.wontFix === null && f.status !== "not-fixed") {
      out.push(`${id}: no fixCommit and no wontFix (status must be "not-fixed" to leave it open)`);
    }

    if (f.evidence.length === 0) out.push(`${id}: no evidence (at least one key is required)`);
    for (const key of f.evidence) {
      if (isIndexKey(key)) {
        if (indexIdentity(before, key) === null) {
          out.push(`${id}: index key ${key} cannot be resolved to a title/project or path in the before summary`);
        }
        continue;
      }
      for (const [label, summary] of [["", before], [" in the after summary", after]] as const) {
        if (!summary) continue;
        try {
          getEvidence(summary, key);
        } catch (e) {
          out.push(`${id}: ${e instanceof Error ? e.message : String(e)}${label}`);
        }
      }
    }

    if (f.planted !== null && !plantedIds.has(f.planted)) {
      out.push(`${id}: planted id ${f.planted} is not in the answer key`);
    }

    for (const lang of ["ro", "en"] as const) {
      for (const field of COPY_FIELDS) {
        const value = f.text[lang][field];
        if (value.trim() === "") out.push(`${id}: text.${lang}.${field} is empty`);
        else if (lang === "ro" && CEDILLA.test(value)) {
          out.push(`${id}: text.ro.${field} uses cedilla diacritics (ş/ţ); use comma-below (ș/ț)`);
        }
      }
    }

    if (f.wontFix !== null) {
      for (const lang of ["ro", "en"] as const) {
        if (f.wontFix[lang].trim() === "") out.push(`${id}: wontFix.${lang} is empty`);
      }
      if (CEDILLA.test(f.wontFix.ro)) {
        out.push(`${id}: wontFix.ro uses cedilla diacritics (ş/ţ); use comma-below (ș/ț)`);
      }
    }
  }
  return out;
}
