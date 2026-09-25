import { STICKERS, type StickerName } from "@/lib/stickers";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  name: StickerName;
  eager?: boolean;
};

/** Sticker recortado de las imágenes de referencia. Decorativo por defecto. */
export function Sticker({ name, eager, className, alt = "", ...rest }: Props) {
  const [w, h] = STICKERS[name];
  return (
    <img
      src={`/stickers/${name}.webp`}
      width={w}
      height={h}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={`sticker ${className ?? ""}`}
      {...rest}
    />
  );
}

export function stickerSrc(name: StickerName) {
  return `/stickers/${name}.webp`;
}
