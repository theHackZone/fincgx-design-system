/*
 * Generated from tokens/tokens.json. Do not edit.
 * Edit the source and run `npm run build`; palette.d.ts is output, not input.
 */

export type Palette = {
  scheme: "light" | "dark";
  background: string;
  surface: string;
  surfaceInset: string;
  surfacePressed: string;
  line: string;
  lineStrong: string;
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  inkInverse: string;
  brandYellow: string;
  brandYellowInk: string;
  brand: string;
  brandStrong: string;
  brandSoft: string;
  success: string;
  successSoft: string;
  warn: string;
  warnSoft: string;
  danger: string;
  dangerStrong: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  neutral: string;
  neutralSoft: string;
  overlay: string;
  chartSeries1: string;
  chartSeries2: string;
  chartSingle: string;
  chartTrack: string;
  chartGrid: string;
  chartAxis: string;
  severityGood: string;
  severityWarning: string;
  severitySerious: string;
  severityCritical: string;
  brand50: string;
  brand100: string;
  brand200: string;
  brand300: string;
  brand400: string;
  brand500: string;
  brand600: string;
  brand700: string;
  brand800: string;
  brand900: string;
  brand950: string;
};

export type TypeRole = {
  fontSize: number;
  lineHeight: number;
  fontWeight: "400" | "500" | "600";
};

export declare const LIGHT: Palette;
export declare const DARK: Palette;
export declare const TYPE: Record<
  | "figure"
  | "title"
  | "heading"
  | "body"
  | "bodyStrong"
  | "label"
  | "caption"
  | "mono",
  TypeRole
>;
export declare const FONT: {
  sans: string;
  mono: string;
  weights: number[];
  /** PostScript names, which is what React Native resolves a fontFamily to. */
  faces: {
    sans: Record<"400" | "500" | "600", string>;
    mono: Record<"500", string>;
  };
};
export declare const SPACE: Record<"xs" | "sm" | "md" | "lg" | "xl" | "xxl", number>;
export declare const RADIUS: Record<"sm" | "md" | "lg" | "pill", number>;
export declare const TAP_TARGET: number;
