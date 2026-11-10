import type { Day } from "../content/restaurant";
import { restaurant } from "../content/restaurant";

/** The week as people read it in Romania: Monday first. */
export const WEEK: { day: Day; name: string }[] = [
  { day: 1, name: "Luni" },
  { day: 2, name: "Marți" },
  { day: 3, name: "Miercuri" },
  { day: 4, name: "Joi" },
  { day: 5, name: "Vineri" },
  { day: 6, name: "Sâmbătă" },
  { day: 0, name: "Duminică" },
];

export default function HoursTable() {
  return (
    <table className="w-full text-[15px]">
      <tbody>
        {WEEK.map(({ day, name }) => {
          const h = restaurant.hours[day];
          return (
            <tr key={day} className="border-b border-ink/10 last:border-0">
              <th scope="row" className="py-2.5 text-left font-medium">
                {name}
              </th>
              <td className={`py-2.5 text-right tabular-nums ${h ? "" : "text-muted"}`}>
                {h ? `${h.open}–${h.close}` : "Închis"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
