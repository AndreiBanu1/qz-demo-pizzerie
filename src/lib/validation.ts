import type { DayHours } from "../content/restaurant";

export type Check<T> = { ok: true; value: T } | { ok: false; message: string };

export function checkName(s: string): Check<string> {
  const v = s.trim();
  if (v.length < 2 || v.length > 60) {
    return { ok: false, message: "Scrie un nume între 2 și 60 de caractere." };
  }
  return { ok: true, value: v };
}

export function checkRoPhone(s: string): Check<string> {
  const v = s.replace(/[\s.\-]/g, "");
  const m = /^(?:\+40|0040|0)([237]\d{8})$/.exec(v);
  if (!m) {
    return { ok: false, message: "Numărul de telefon nu pare corect. Exemplu: 0712 345 678." };
  }
  return { ok: true, value: `+40${m[1]}` };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** `today` is read with local getters: pass the date as the visitor's calendar day. */
export function checkRoDate(s: string, today: Date): Check<string> {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(s.trim());
  if (!m) return { ok: false, message: "Scrie data așa: zz.ll.aaaa, de exemplu 20.11.2026." };
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) {
    return { ok: false, message: "Data aceasta nu există în calendar." };
  }
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((date.getTime() - start.getTime()) / 86_400_000);
  if (days < 0) return { ok: false, message: "Data este în trecut. Alege o zi de azi încolo." };
  if (days > 60) return { ok: false, message: "Poți rezerva cel mult 60 de zile înainte." };
  if (date.getDay() === 1) return { ok: false, message: "Luni suntem închiși. Alege altă zi." };
  return { ok: true, value: `${y}-${pad(mo)}-${pad(d)}` };
}

/** Half-hour slots from opening up to one hour before closing. */
export function timeSlots(day: DayHours): string[] {
  if (!day) return [];
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const slots: string[] = [];
  for (let t = toMin(day.open); t <= toMin(day.close) - 60; t += 30) {
    slots.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }
  return slots;
}
