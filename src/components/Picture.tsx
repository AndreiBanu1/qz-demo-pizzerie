import imageSizes from "../content/image-sizes.json";

// Must match the widths scripts/images.mjs writes.
const MENU_WIDTHS = [200, 400, 800];
const HERO_WIDTHS = [640, 1280, 1920];

type Props = {
  /** The photo's file name, with or without the .jpg ending, as in src/content/menu.ts. */
  name: string;
  /** Describes the photo for people who cannot see it. Required. */
  alt: string;
  /** Tells the browser how wide the photo is shown, so it picks the smallest file that is sharp enough. */
  sizes: string;
  className?: string;
  /** The photo that is the largest thing in view on load: fetched first and never lazy. */
  priority?: boolean;
};

const srcSet = (base: string, widths: number[], ext: string) =>
  widths.map((w) => `/img/${base}-${w}.${ext} ${w}w`).join(", ");

export default function Picture({ name, alt, sizes, className, priority = false }: Props) {
  const base = name.replace(/\.jpe?g$/i, "");
  const dimensions = (imageSizes as Record<string, { width: number; height: number }>)[base];
  if (!dimensions) throw new Error(`No size recorded for the photo "${base}". Run node scripts/images.mjs.`);
  const widths = base.startsWith("hero-") ? HERO_WIDTHS : MENU_WIDTHS;
  const fallbackWidth = widths[Math.floor(widths.length / 2)];
  // React 18 does not know the camelCase fetchPriority prop, so the lowercase attribute is passed through.
  const priorityAttrs = priority ? ({ fetchpriority: "high" } as Record<string, string>) : {};
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(base, widths, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(base, widths, "webp")} sizes={sizes} />
      <img
        src={`/img/${base}-${fallbackWidth}.webp`}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...priorityAttrs}
      />
    </picture>
  );
}
