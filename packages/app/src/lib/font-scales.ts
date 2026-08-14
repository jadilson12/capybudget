/** Root font size, as a multiplier of the browser default (16px).
 *  Every size in the app is rem-based, so scaling the root scales the whole UI
 *  — spacing included — instead of only the text. */
export const FONT_SCALES = {
  small: 0.875,
  default: 1,
  large: 1.125,
  larger: 1.25,
} as const;

export type FontScale = keyof typeof FONT_SCALES;

export const DEFAULT_FONT_SCALE: FontScale = "default";
export const FONT_SCALE_STORAGE_KEY = "font-scale";

export function isFontScale(value: unknown): value is FontScale {
  return typeof value === "string" && value in FONT_SCALES;
}
