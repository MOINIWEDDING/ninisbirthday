import localFont from "next/font/local";

export const script = localFont({
  src: "./fonts/Courgette-Regular.woff2",
  variable: "--nf-script",
  display: "swap",
  fallback: ["Brush Script MT", "cursive"],
});

export const condensed = localFont({
  src: [
    { path: "./fonts/BarlowCondensed-Medium.woff2", weight: "500" },
    { path: "./fonts/BarlowCondensed-SemiBold.woff2", weight: "600" },
    { path: "./fonts/BarlowCondensed-Bold.woff2", weight: "700" },
  ],
  variable: "--nf-condensed",
  display: "swap",
  fallback: ["Arial Narrow", "system-ui", "sans-serif"],
});

export const serif = localFont({
  src: [
    { path: "./fonts/DMSerifDisplay-Regular.woff2", style: "normal", weight: "400" },
    { path: "./fonts/DMSerifDisplay-Italic.woff2", style: "italic", weight: "400" },
  ],
  variable: "--nf-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const body = localFont({
  src: "./fonts/Outfit.woff2",
  variable: "--nf-body",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
