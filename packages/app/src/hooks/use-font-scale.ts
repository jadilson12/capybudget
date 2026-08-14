import { useEffect } from "react";
import { FONT_SCALES } from "@/lib/font-scales";
import { useAppStore } from "@/stores/app-store";

/** Applies the stored font scale to the document root.
 *  Mounted once at the layout root — the store owns the value, this only
 *  reflects it into the DOM. */
export function useApplyFontScale() {
  const fontScale = useAppStore((s) => s.fontScale);

  useEffect(() => {
    // Percentage, not px: it stays relative to the user's browser/OS font size,
    // so an accessibility setting outside the app still compounds with this one.
    document.documentElement.style.fontSize = `${FONT_SCALES[fontScale] * 100}%`;
  }, [fontScale]);
}
