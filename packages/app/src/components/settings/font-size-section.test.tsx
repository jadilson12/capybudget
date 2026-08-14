import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useApplyFontScale } from "@/hooks/use-font-scale"
import { useAppStore } from "@/stores/app-store"
import { FontSizeSection } from "./font-size-section"

// The root layout is what reflects the stored scale into the DOM; stand in for
// it here so the section's effect on the document is covered end to end.
function Harness() {
  useApplyFontScale()
  return <FontSizeSection />
}

beforeEach(() => {
  useAppStore.setState({ fontScale: "default" })
  document.documentElement.style.fontSize = ""
})

afterEach(cleanup)

describe("FontSizeSection", () => {
  it("renders the card with the current scale selected", () => {
    render(<Harness />)

    expect(screen.getByText("Font size")).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toHaveTextContent("Default")
  })

  it("scales the root font size when a larger option is picked", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByRole("option", { name: "Large" }))

    expect(useAppStore.getState().fontScale).toBe("large")
    expect(document.documentElement.style.fontSize).toBe("112.5%")
  })

  it("applies a scale already stored in the app store", () => {
    useAppStore.setState({ fontScale: "small" })
    render(<Harness />)

    expect(screen.getByRole("combobox")).toHaveTextContent("Small")
    expect(document.documentElement.style.fontSize).toBe("87.5%")
  })
})
