import { isDateValid } from "../refinements";

describe("isDateValid()", () => {
  describe("when called with an invalid date", () => {
    it("returns false", () => {
      expect(isDateValid("foobar")).toBe(false);
    });
  });

  describe("when called with a valid date", () => {
    it("returns false", () => {
      expect(isDateValid("2021-01-01")).toBe(true);
    });
  });
});
