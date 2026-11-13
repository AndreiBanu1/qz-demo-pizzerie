import { useState, type FormEvent, type ReactNode } from "react";
import CallButton from "../components/CallButton";
import HoursTable from "../components/HoursTable";
import { restaurant, type Day } from "../content/restaurant";
import { bucharestToday } from "../lib/hours";
import { checkName, checkRoDate, checkRoPhone, timeSlots } from "../lib/validation";

type FieldName = "nume" | "telefon" | "data" | "ora" | "persoane";
type Errors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["nume", "telefon", "data", "ora", "persoane"];
const PEOPLE = Array.from({ length: 12 }, (_, i) => i + 1);

const controlClass = (error?: string) =>
  `min-h-12 w-full rounded-xl border bg-cream/40 px-3.5 py-3 text-base placeholder:text-muted focus:border-tomato focus:outline-none focus:ring-2 focus:ring-tomato/30 ${
    error ? "border-tomato" : "border-ink/20"
  }`;

/** A label, the field itself (passed in), and the error under it, linked with aria-describedby. */
function Field({
  name,
  label,
  error,
  className = "",
  children,
}: {
  name: FieldName;
  label: string;
  error?: string;
  className?: string;
  children: (props: Record<string, string | boolean | undefined>) => ReactNode;
}) {
  const id = `rez-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children({
        id,
        name,
        className: controlClass(error),
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? `${id}-error` : undefined,
      })}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-tomato-dark">
          {error}
        </p>
      )}
    </div>
  );
}

/** A select drawn without the phone's own look, which ignores padding and ends up too short to tap. */
function Chevron() {
  return (
    <svg viewBox="0 0 20 20" className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 8 5 5 5-5" />
    </svg>
  );
}

/** The opening hours of the weekday in a zz.ll.aaaa date, or null if the text is not a real date. */
function dayOfDate(text: string): Day | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text.trim());
  if (!m) return null;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date.getDay() as Day;
}

export default function Reservation() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const day = dayOfDate(date);
  const slots = day === null ? [] : timeSlots(restaurant.hours[day]);
  const timeHint = day === null ? "Alege întâi data" : slots.length === 0 ? "Luni suntem închiși" : "Alege ora";

  // Nothing is sent or stored: the form only checks the fields and shows the demo message.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const value = (k: FieldName) => String(data.get(k) ?? "").trim();
    const next: Errors = {};
    const name = checkName(value("nume"));
    if (!name.ok) next.nume = name.message;
    const phone = checkRoPhone(value("telefon"));
    if (!phone.ok) next.telefon = phone.message;
    const dateCheck = checkRoDate(value("data"), bucharestToday(new Date()));
    if (!dateCheck.ok) next.data = dateCheck.message;
    if (!value("ora")) next.ora = "Alege ora la care vii.";
    if (!value("persoane")) next.persoane = "Alege câte persoane veniți.";
    setErrors(next);
    const first = FIELD_ORDER.find((k) => next[k]);
    if (first) document.getElementById(`rez-${first}`)?.focus();
    else setSent(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8">
      <h1 className="text-5xl md:text-6xl">Rezervă o masă</h1>
      <p className="mt-2 max-w-prose text-muted">Spune-ne cum te cheamă, când vii și câți sunteți.</p>

      <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start">
        {sent ? (
          <div role="status" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
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
          <form noValidate onSubmit={onSubmit} className="w-full max-w-md shrink-0 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field name="nume" label="Nume" error={errors.nume} className="sm:col-span-2">
                {(p) => <input {...p} type="text" autoComplete="name" />}
              </Field>
              <Field name="telefon" label="Telefon" error={errors.telefon} className="sm:col-span-2">
                {(p) => <input {...p} type="tel" inputMode="tel" autoComplete="tel" placeholder="07xx xxx xxx" />}
              </Field>
              <Field name="data" label="Data (zz.ll.aaaa)" error={errors.data} className="sm:col-span-2">
                {(p) => (
                  <input
                    {...p}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="zz.ll.aaaa"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setTime("");
                    }}
                  />
                )}
              </Field>
              <Field name="ora" label="Ora" error={errors.ora}>
                {(p) => (
                  <div className="relative">
                    <select {...p} className={`${p.className} appearance-none pr-10`} value={time} onChange={(e) => setTime(e.target.value)}>
                      <option value="">{timeHint}</option>
                      {slots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <Chevron />
                  </div>
                )}
              </Field>
              <Field name="persoane" label="Persoane" error={errors.persoane}>
                {(p) => (
                  <div className="relative">
                    <select {...p} className={`${p.className} appearance-none pr-10`} defaultValue="">
                      <option value="">Alege</option>
                      {PEOPLE.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <Chevron />
                  </div>
                )}
              </Field>
              <p className="self-center text-sm text-muted">Toate câmpurile sunt obligatorii.</p>
              <button
                type="submit"
                className="justify-self-start rounded-full bg-tomato px-6 py-3.5 font-semibold text-white shadow-[0_3px_0_#7a2410] transition-colors hover:bg-tomato-dark sm:justify-self-end"
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
