import { useState, type FormEvent } from "react";
import CallButton from "../components/CallButton";
import HoursTable from "../components/HoursTable";

type FieldName = "nume" | "telefon" | "data" | "ora" | "persoane";
type Errors = Partial<Record<FieldName, string>>;

function Field({
  name,
  label,
  placeholder,
  error,
  type = "text",
  className = "",
}: {
  name: FieldName;
  label: string;
  placeholder: string;
  error?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={`rez-${name}`} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {/* PLANTED P-07: text-sm (14 px) inputs make iOS zoom in */}
      <input
        id={`rez-${name}`}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-cream/40 px-3.5 py-3 text-sm placeholder:text-muted focus:border-tomato focus:outline-none focus:ring-2 focus:ring-tomato/30 ${
          error ? "border-tomato" : "border-ink/20"
        }`}
      />
      {error && <p className="mt-1.5 text-sm text-tomato-dark">{error}</p>}
    </div>
  );
}

export default function Reservation() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  // Nothing is sent or stored: the form only checks the fields and shows the demo message.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const value = (k: FieldName) => String(data.get(k) ?? "").trim();
    const next: Errors = {};
    if (value("nume").length < 2) next.nume = "Scrie-ți numele.";
    if (!/^\d{10}$/.test(value("telefon"))) next.telefon = "Numărul de telefon nu este valid."; // PLANTED P-07: rejects spaces and +40
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value("data"))) next.data = "Data nu este validă."; // PLANTED P-07: wants MM/DD/YYYY
    if (!value("ora")) next.ora = "Scrie ora la care vii.";
    if (!value("persoane")) next.persoane = "Scrie câte persoane veniți.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8">
      <h1 className="text-5xl md:text-6xl">Rezervă o masă</h1>
      <p className="mt-2 max-w-prose text-muted">Spune-ne cum te cheamă, când vii și câți sunteți.</p>

      <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start">
        {sent ? (
          <div role="status" className="w-full max-w-[600px] rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
            <p className="font-display text-2xl font-semibold tracking-tight">Site demonstrativ: rezervarea nu a fost trimisă</p>
            <p className="mt-2 text-muted">Nu am trimis și nu am păstrat nimic din ce ai scris.</p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setErrors({});
              }}
              className="mt-5 inline-flex rounded-full border-2 border-ink px-5 py-2.5 font-semibold transition-colors hover:bg-ink hover:text-cream"
            >
              Fă altă rezervare
            </button>
          </div>
        ) : (
          // PLANTED P-07: a fixed 600 px width, so on a phone the page scrolls sideways and the button is off screen
          <form noValidate onSubmit={onSubmit} className="w-[600px] shrink-0 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
            <div className="grid grid-cols-2 gap-4">
              <Field name="nume" label="Nume" placeholder="Nume" error={errors.nume} className="col-span-2" />
              <Field name="telefon" label="Telefon" type="tel" placeholder="Telefon" error={errors.telefon} />
              <Field name="data" label="Data (zz.ll.aaaa)" placeholder="Data" error={errors.data} />
              <Field name="ora" label="Ora" placeholder="Ora" error={errors.ora} />
              <Field name="persoane" label="Persoane" type="number" placeholder="Persoane" error={errors.persoane} />
              <p className="self-center text-sm text-muted">Toate câmpurile sunt obligatorii.</p>
              <button
                type="submit"
                className="justify-self-end rounded-full bg-tomato px-6 py-3.5 font-semibold text-white shadow-[0_3px_0_#7a2410] transition-colors hover:bg-tomato-dark"
              >
                Rezervă masa
              </button>
            </div>
          </form>
        )}

        <section aria-labelledby="suna-titlu" className="space-y-8 lg:w-72">
          <div>
            <h2 id="suna-titlu" className="text-2xl">
              Preferi să suni?
            </h2>
            <p className="mt-1 text-muted">Îți răspundem în timpul programului.</p>
            <CallButton className="mt-4" />
          </div>
          <div>
            <h2 className="text-2xl">Program</h2>
            <div className="mt-2">
              <HoursTable />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
