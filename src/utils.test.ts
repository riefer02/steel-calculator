import { describe, it, expect } from "vitest";
import { safeDivide } from "./utils";

describe("safeDivide", () => {
  it("divides two positive numbers", () => {
    expect(safeDivide(10, 2)).toBe(5);
  });

  it("returns 0 when denominator is 0", () => {
    expect(safeDivide(10, 0)).toBe(0);
  });

  it("returns 0 when denominator is Infinity", () => {
    expect(safeDivide(10, Infinity)).toBe(0);
  });

  it("returns 0 when denominator is -Infinity", () => {
    expect(safeDivide(10, -Infinity)).toBe(0);
  });

  it("returns 0 when denominator is NaN", () => {
    expect(safeDivide(10, NaN)).toBe(0);
  });

  it("returns 0 when numerator is Infinity and denominator is 0", () => {
    expect(safeDivide(Infinity, 0)).toBe(0);
  });

  it("handles negative numerator", () => {
    expect(safeDivide(-10, 2)).toBe(-5);
  });

  it("handles negative denominator", () => {
    expect(safeDivide(10, -2)).toBe(-5);
  });

  it("returns 0 for 0/0", () => {
    expect(safeDivide(0, 0)).toBe(0);
  });

  it("returns 0 when numerator is 0", () => {
    expect(safeDivide(0, 5)).toBe(0);
  });
});
