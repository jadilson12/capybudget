import { useTranslation } from "@capybudget/i18n"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FONT_SCALES, isFontScale, type FontScale } from "@/lib/font-scales"
import type { SettingsKey } from "@/lib/i18n-keys"
import { useAppStore } from "@/stores/app-store"

const OPTION_KEY = {
  small: "fontSize.options.small",
  default: "fontSize.options.default",
  large: "fontSize.options.large",
  larger: "fontSize.options.larger",
} satisfies Record<FontScale, SettingsKey>

const SCALES = Object.keys(FONT_SCALES) as FontScale[]

export function FontSizeSection() {
  const { t } = useTranslation("settings")
  const fontScale = useAppStore((s) => s.fontScale)
  const setFontScale = useAppStore((s) => s.setFontScale)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("fontSize.title")}</CardTitle>
        <CardDescription>{t("fontSize.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Select
          value={fontScale}
          onValueChange={(v) => {
            if (isFontScale(v)) setFontScale(v)
          }}
        >
          <SelectTrigger id="font-size" className="w-full" aria-label={t("fontSize.title")}>
            <SelectValue>
              {(value: string | null) =>
                isFontScale(value) ? t(OPTION_KEY[value]) : value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="w-auto min-w-(--anchor-width)">
            {SCALES.map((scale) => (
              <SelectItem key={scale} value={scale}>
                {t(OPTION_KEY[scale])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">{t("fontSize.hint")}</p>
      </CardContent>
    </Card>
  )
}
