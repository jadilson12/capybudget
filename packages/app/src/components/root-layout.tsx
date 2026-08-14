import { Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@capybudget/i18n";
import { ColorThemeProvider } from "@/components/color-theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { useApplyFontScale } from "@/hooks/use-font-scale";
import { useStrayDropGuard } from "@/hooks/use-stray-drop-guard";

export function RootLayout() {
  useStrayDropGuard();
  useApplyFontScale();

  return (
    <I18nProvider>
      <ThemeProvider attribute="class" defaultTheme="system">
        <ColorThemeProvider>
          <Outlet />
          <Toaster />
        </ColorThemeProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
