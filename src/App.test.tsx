import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

function getInput(label: string): HTMLInputElement {
  return screen.getByLabelText(label) as HTMLInputElement;
}

async function fillInput(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  value: string
) {
  const input = getInput(label);
  await user.clear(input);
  await user.type(input, value);
}

async function fillCalculatorInputs(
  user: ReturnType<typeof userEvent.setup>,
  values: {
    od?: string;
    length?: string;
    pieces?: string;
    costPerLb?: string;
    externalCosts?: string;
    margin?: string;
  }
) {
  if (values.od) await fillInput(user, "Outside Diameter (inches):", values.od);
  if (values.length) await fillInput(user, "Length (inches):", values.length);
  if (values.pieces) await fillInput(user, "Pieces:", values.pieces);
  if (values.costPerLb)
    await fillInput(user, "Cost per Pound:", values.costPerLb);
  if (values.externalCosts)
    await fillInput(user, "External Costs:", values.externalCosts);
  if (values.margin) await fillInput(user, "Margin", values.margin);
}

function getOutputText(label: string): string {
  const el = screen.getByText(label).nextElementSibling;
  return el?.textContent?.trim() ?? "";
}

describe("App", () => {
  describe("rendering", () => {
    it("renders the title", () => {
      render(<App />);
      expect(screen.getByText("Steel Calculator")).toBeInTheDocument();
    });

    it("renders all three sections", () => {
      render(<App />);
      expect(screen.getByText("Inputs")).toBeInTheDocument();
      expect(screen.getByText("Outputs")).toBeInTheDocument();
      expect(screen.getByText("Breakdown")).toBeInTheDocument();
    });

    it("renders all input labels", () => {
      render(<App />);
      expect(
        screen.getByLabelText("Outside Diameter (inches):")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Length (inches):")).toBeInTheDocument();
      expect(screen.getByLabelText("Pieces:")).toBeInTheDocument();
      expect(screen.getByLabelText("Cost per Pound:")).toBeInTheDocument();
      expect(screen.getByLabelText("External Costs:")).toBeInTheDocument();
      expect(screen.getByLabelText("Margin")).toBeInTheDocument();
    });

    it("renders the Reset button", () => {
      render(<App />);
      expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    });
  });

  describe("decimal input (regression: commit 61eb72d)", () => {
    it("allows decimal values in Outside Diameter", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillInput(user, "Outside Diameter (inches):", "1.5");

      expect(getInput("Outside Diameter (inches):").value).toBe("1.5");
    });

    it("allows decimal values in Length", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillInput(user, "Length (inches):", "240.75");

      expect(getInput("Length (inches):").value).toBe("240.75");
    });

    it("allows decimal values in Pieces", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillInput(user, "Pieces:", "10.5");

      expect(getInput("Pieces:").value).toBe("10.5");
    });

    it("allows decimal values in Cost per Pound", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillInput(user, "Cost per Pound:", "0.4567");

      expect(getInput("Cost per Pound:").value).toContain("0.4567");
    });

    it("allows decimal values in External Costs", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillInput(user, "External Costs:", "150.50");

      expect(getInput("External Costs:").value).toContain("150.5");
    });
  });

  describe("input validation (matches original regex)", () => {
    it("does not allow negative values in Outside Diameter", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillInput(user, "Outside Diameter (inches):", "-5");

      expect(getInput("Outside Diameter (inches):").value).not.toContain("-");
    });

    it("does not allow negative values in Length", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillInput(user, "Length (inches):", "-100");

      expect(getInput("Length (inches):").value).not.toContain("-");
    });

    it("does not allow negative values in Pieces", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillInput(user, "Pieces:", "-10");

      expect(getInput("Pieces:").value).not.toContain("-");
    });

    it("does not allow negative values in Cost per Pound", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillInput(user, "Cost per Pound:", "-5");

      expect(getInput("Cost per Pound:").value).not.toContain("-");
    });
  });

  describe("calculation flow", () => {
    // Weight formula: (OD^2 * 2.67 / 12) * Length * Pieces
    // Total Cost = weight * costPerLb + externalCost
    // Total Charge = totalCost / (1 - margin/100)

    it("calculates total pounds from OD, length, and pieces", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillCalculatorInputs(user, {
        od: "2",
        length: "240",
        pieces: "10",
      });

      // Weight = (2^2 * 2.67 / 12) * 240 * 10 = 2136
      await waitFor(() => {
        expect(getOutputText("Total Pounds:")).toBe("2,136");
      });
    });

    it("calculates total cost from inputs", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillCalculatorInputs(user, {
        od: "2",
        length: "240",
        pieces: "10",
        costPerLb: "0.50",
      });

      // Total Cost = 2136 * 0.50 + 0 = 1068
      await waitFor(() => {
        expect(getOutputText("Total Cost:")).toBe("$1,068");
      });
    });

    it("includes external costs in total cost", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillCalculatorInputs(user, {
        od: "2",
        length: "240",
        pieces: "10",
        costPerLb: "0.50",
        externalCosts: "100",
      });

      // Total Cost = 2136 * 0.50 + 100 = 1168
      await waitFor(() => {
        expect(getOutputText("Total Cost:")).toBe("$1,168");
      });
    });

    it("calculates total price using margin", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillCalculatorInputs(user, {
        od: "2",
        length: "240",
        pieces: "10",
        costPerLb: "0.50",
        margin: "20",
      });

      // Total Charge = 1068 / (1 - 0.20) = 1335
      await waitFor(() => {
        expect(getOutputText("Total Price:")).toBe("$1,335");
      });
    });

    it("calculates gross profit", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillCalculatorInputs(user, {
        od: "2",
        length: "240",
        pieces: "10",
        costPerLb: "0.50",
        margin: "20",
      });

      // Gross Profit = 1335 - 1068 = 267
      await waitFor(() => {
        expect(getOutputText("Gross Profit:")).toBe("$267");
      });
    });

    it("handles fractional OD values correctly", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillCalculatorInputs(user, {
        od: "1.5",
        length: "120",
        pieces: "5",
      });

      // Weight = (1.5^2 * 2.67 / 12) * 120 * 5 = 300.375 → 300.38
      await waitFor(() => {
        expect(getOutputText("Total Pounds:")).toBe("300.38");
      });
    });
  });

  describe("edge cases", () => {
    it("shows zero values when all inputs are zero", () => {
      render(<App />);

      expect(getOutputText("Total Cost:")).toBe("$0");
      expect(getOutputText("Total Price:")).toBe("$0");
      expect(getOutputText("Gross Profit:")).toBe("$0");
    });

    it("handles zero margin (total price equals total cost)", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillCalculatorInputs(user, {
        od: "2",
        length: "240",
        pieces: "10",
        costPerLb: "0.50",
      });

      await waitFor(() => {
        expect(getOutputText("Total Cost:")).toBe("$1,068");
        expect(getOutputText("Total Price:")).toBe("$1,068");
        expect(getOutputText("Gross Profit:")).toBe("$0");
      });
    });

    it("prevents margin >= 100%", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillInput(user, "Margin", "100");

      // isAllowed should reject 100
      expect(getInput("Margin").value).not.toBe("100%");
    });
  });

  describe("reset", () => {
    it("clears all input fields when Reset is clicked", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillCalculatorInputs(user, {
        od: "2",
        length: "240",
        pieces: "10",
        costPerLb: "0.50",
        externalCosts: "100",
        margin: "20",
      });

      await user.click(screen.getByRole("button", { name: "Reset" }));

      await waitFor(() => {
        expect(getInput("Outside Diameter (inches):").value).toBe("0");
        expect(getInput("Length (inches):").value).toBe("0");
        expect(getInput("Pieces:").value).toBe("0");
        expect(getInput("Cost per Pound:").value).toBe("$0");
        expect(getInput("External Costs:").value).toBe("$0");
        expect(getInput("Margin").value).toBe("0%");
      });
    });

    it("resets outputs to zero after reset", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillCalculatorInputs(user, {
        od: "2",
        length: "240",
        pieces: "10",
        costPerLb: "0.50",
        margin: "20",
      });

      await waitFor(() => {
        expect(getOutputText("Total Price:")).toBe("$1,335");
      });

      await user.click(screen.getByRole("button", { name: "Reset" }));

      await waitFor(() => {
        expect(getOutputText("Total Cost:")).toBe("$0");
        expect(getOutputText("Total Price:")).toBe("$0");
        expect(getOutputText("Gross Profit:")).toBe("$0");
      });
    });
  });

  describe("breakdown fields", () => {
    it("calculates price per piece", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillCalculatorInputs(user, {
        od: "2",
        length: "240",
        pieces: "10",
        costPerLb: "0.50",
        margin: "20",
      });

      // Price per Piece = 1335 / 10 = 133.5
      await waitFor(() => {
        expect(getInput("Price per Piece:").value).toBe("$133.5");
      });
    });

    it("calculates price per inch", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillCalculatorInputs(user, {
        od: "2",
        length: "240",
        pieces: "10",
        costPerLb: "0.50",
        margin: "20",
      });

      // Price per Inch = 1335 / (240 * 10) = 0.55625 → 0.56
      await waitFor(() => {
        expect(getInput("Price per Inch:").value).toBe("$0.56");
      });
    });

    it("calculates price per pound", async () => {
      const user = userEvent.setup();
      render(<App />);

      await fillCalculatorInputs(user, {
        od: "2",
        length: "240",
        pieces: "10",
        costPerLb: "0.50",
        margin: "20",
      });

      // Price per Pound = 1335 / 2136 ≈ 0.625 → 0.63
      await waitFor(() => {
        expect(getInput("Price per Pound:").value).toBe("$0.63");
      });
    });

    it("recalculates margin when price per piece is edited", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      await fillCalculatorInputs(user, {
        od: "2",
        length: "240",
        pieces: "10",
        costPerLb: "0.50",
        margin: "20",
      });

      await waitFor(() => {
        expect(getInput("Price per Piece:").value).toBe("$133.5");
      });

      // Edit price per piece to $200
      const pricePerPiece = getInput("Price per Piece:");
      await user.clear(pricePerPiece);
      await user.type(pricePerPiece, "200");

      // Wait for debounce (1000ms)
      vi.advanceTimersByTime(1100);

      // New gross revenue = 200 * 10 = 2000
      // Net profit = 2000 - 1068 = 932
      // New margin = 932 / 2000 * 100 = 46.6%
      await waitFor(() => {
        expect(getInput("Margin").value).toBe("46.6%");
      });

      vi.useRealTimers();
    });
  });
});
