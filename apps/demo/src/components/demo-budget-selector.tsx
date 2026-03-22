import { useNavigate } from "@tanstack/react-router";

import { ThemeToggle } from "@/components/theme-toggle";
import { ColorThemeSwitcher } from "@/components/color-theme-switcher";
import { PRESET_LIST } from "../data/presets";
import type { DemoPreset } from "../data/presets";

const PRESET_STICKERS: Record<string, string> = {
  underwater: "/capy-broke.png",
  "paycheck-to-paycheck": "/capy-fine.png",
  "no-stress": "/capy-great.png",
};

export function DemoBudgetSelector() {
  const navigate = useNavigate();

  function handleSelect(preset: DemoPreset) {
    navigate({
      to: "/budget",
      search: { path: preset.id, name: preset.name },
    });
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <ColorThemeSwitcher />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-3xl space-y-8 px-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Capy Budget</h1>
          <p className="text-muted-foreground">
            Select a budget to explore
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
          {PRESET_LIST.map((preset) => {
            const sticker = PRESET_STICKERS[preset.id];
            return (
              <button
                key={preset.id}
                className="flex flex-col items-center gap-3 cursor-pointer transition-transform hover:scale-110"
                onClick={() => handleSelect(preset)}
              >
                {sticker && (
                  <img
                    src={sticker}
                    alt={preset.name}
                    className="h-40 w-40 object-contain"
                  />
                )}
                <span className="text-lg font-semibold whitespace-nowrap">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
