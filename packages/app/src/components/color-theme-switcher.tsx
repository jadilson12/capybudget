import { Palette } from "lucide-react";
import { useTranslation } from "@capybudget/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useColorTheme } from "@/contexts/color-theme-context";
import { COLOR_THEMES, type ColorTheme } from "@/lib/color-themes";
import type { CommonKey } from "@/lib/i18n-keys";

const entries = Object.entries(COLOR_THEMES) as [
  ColorTheme,
  (typeof COLOR_THEMES)[ColorTheme],
][];

const LABEL_KEY = {
  capybara: "colorTheme.capybara",
  ocean: "colorTheme.ocean",
  forest: "colorTheme.forest",
  rose: "colorTheme.rose",
  slate: "colorTheme.slate",
  midnight: "colorTheme.midnight",
} satisfies Record<ColorTheme, CommonKey>;

export function ColorThemeSwitcher() {
  const { t } = useTranslation("common");
  const { colorTheme, setColorTheme } = useColorTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t("theme.colorTheme")} />
        }
      >
        <Palette className="h-4 w-4" />
      </DropdownMenuTrigger>
      {/* The trigger is a 32px icon button, so the default w-(--anchor-width)
          leaves the menu at its min-w-32 floor and wraps longer labels
          ("Meia-noite", "Medianoche"). Let it size to its own content. */}
      <DropdownMenuContent align="end" className="w-auto whitespace-nowrap">
        <DropdownMenuRadioGroup
          value={colorTheme}
          onValueChange={(v) => setColorTheme(v as ColorTheme)}
        >
          {entries.map(([key, { swatch }]) => (
            <DropdownMenuRadioItem key={key} value={key}>
              <span
                className="inline-block h-3 w-3 rounded-full border border-foreground/15"
                style={{ background: swatch }}
              />
              {t(LABEL_KEY[key])}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
