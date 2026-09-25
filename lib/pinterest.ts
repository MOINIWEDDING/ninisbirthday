import "server-only";
import { DRESS_CODE } from "./event";

export type Pin = { id: string; image: string; link: string; title: string };

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function tag(item: string, name: string) {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]).trim() : "";
}

/**
 * Lee las fotos del tablero desde el RSS público de Pinterest.
 * Se guarda en caché una hora; si el tablero es secreto o Pinterest no responde, devuelve [].
 */
export async function getBoardPins(): Promise<Pin[]> {
  const url = `https://www.pinterest.com/${DRESS_CODE.pinterestUser}/${DRESS_CODE.pinterestBoard}.rss`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NinisBirthday/1.0)", Accept: "application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
    const pins: Pin[] = [];
    for (const item of items) {
      const desc = tag(item, "description");
      const src = desc.match(/<img[^>]+src="([^"]+)"/i)?.[1];
      if (!src || !/^https:\/\/i\.pinimg\.com\//.test(src)) continue;
      const link = tag(item, "link") || tag(item, "guid");
      const id = link.match(/\/pin\/(\d+)/)?.[1] ?? src;
      pins.push({
        id,
        // El RSS trae miniaturas de 236px; pedimos la versión de 564px
        image: src.replace(/\/\d+x\//, "/564x/"),
        link: /^https:\/\/([a-z]+\.)?pinterest\.[a-z.]+\//.test(link) ? link : DRESS_CODE.boardUrl,
        title: tag(item, "title").slice(0, 120),
      });
      if (pins.length >= DRESS_CODE.maxPins) break;
    }
    return pins;
  } catch {
    return [];
  }
}
