import Picture from "./Picture";
import type { MenuItem as MenuItemData } from "../content/menu";

export default function MenuItem({ item }: { item: MenuItemData }) {
  return (
    <li className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-ink/5">
      {/* PLANTED P-03: no alt text */}
      {item.photo && <Picture name={item.photo.file} sizes="96px" className="h-24 w-24 shrink-0 rounded-xl object-cover" />}
      <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg leading-tight">{item.name}</h3>
          {/* PLANTED P-04: light grey price on a white card */}
          <p className="shrink-0 font-semibold tabular-nums text-gray-300">{item.priceLei} lei</p>
        </div>
        <p className="mt-1 text-sm leading-snug text-muted">{item.ingredients}</p>
      </div>
    </li>
  );
}
