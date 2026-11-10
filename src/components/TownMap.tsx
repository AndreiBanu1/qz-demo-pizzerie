import { restaurant } from "../content/restaurant";

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Pizza%20Mi%C8%9Ba";
const LABEL = "system-ui, -apple-system, Segoe UI, sans-serif";

/** A drawn map of a few made-up streets. It's not a real place. */
export default function TownMap() {
  return (
    <div>
      <svg
        viewBox="0 0 360 230"
        role="img"
        aria-label={`Hartă desenată: ${restaurant.name}, pe ${restaurant.street}, la colț cu Bulevardul Demo, în ${restaurant.town}`}
        className="h-auto w-full rounded-2xl"
      >
        <rect width="360" height="230" fill="#F1E4CE" />
        {/* blocks */}
        <g fill="#E6D3B4">
          <rect x="12" y="12" width="96" height="70" rx="8" />
          <rect x="12" y="124" width="96" height="94" rx="8" />
          <rect x="152" y="124" width="92" height="94" rx="8" />
          <rect x="288" y="12" width="60" height="70" rx="8" />
          <rect x="288" y="124" width="60" height="94" rx="8" />
        </g>
        {/* park */}
        <rect x="152" y="12" width="92" height="70" rx="8" fill="#CFDDBF" />
        <g fill="#9DB88A">
          <circle cx="172" cy="34" r="9" />
          <circle cx="196" cy="56" r="11" />
          <circle cx="224" cy="32" r="8" />
        </g>
        <text x="198" y="78" textAnchor="middle" fontFamily={LABEL} fontSize="10" fill="#4B6440">
          Parcul Mic
        </text>
        {/* streets */}
        <g fill="#FFFDF8">
          <rect x="0" y="88" width="360" height="30" />
          <rect x="114" y="0" width="32" height="230" />
          <rect x="250" y="0" width="32" height="230" />
        </g>
        <text x="20" y="106.5" fontFamily={LABEL} fontSize="10" fontWeight="600" fill="#6B5647">
          Strada Exemplului
        </text>
        <text x="0" y="0" transform="translate(133.5 196) rotate(-90)" fontFamily={LABEL} fontSize="10" fontWeight="600" fill="#6B5647">
          Bulevardul Demo
        </text>
        {/* pin */}
        <ellipse cx="172" cy="124" rx="10" ry="3.5" fill="#2B1E16" opacity="0.18" />
        <path d="M172 124 C164 112 158 106 158 98 a14 14 0 0 1 28 0 c0 8 -6 14 -14 26 Z" fill="#C2391B" />
        <circle cx="172" cy="98" r="5" fill="#FFFDF8" />
        <rect x="190" y="132" width="88" height="26" rx="13" fill="#2B1E16" />
        <text x="234" y="149" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontSize="13" fontWeight="600" fill="#FBF4E8">
          {restaurant.name}
        </text>
      </svg>
      <a
        href={MAPS_URL}
        className="mt-3 inline-flex items-center gap-1.5 py-1 font-semibold text-tomato-dark underline underline-offset-4"
      >
        Deschide în Maps
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
