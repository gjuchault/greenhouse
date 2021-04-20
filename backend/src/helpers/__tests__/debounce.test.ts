import { debounce } from "../debounce";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("debounce()", () => {
  describe("when called with a dummy function and a waitFor parameter", () => {
    it("returns a Map indexed by the key", async () => {
      let result: number = 0;

      const dummyFn = () => {
        result += 1;
      };

      const waitFor = 50;

      const debouncedDummyFn = debounce(dummyFn, waitFor);

      debouncedDummyFn();
      debouncedDummyFn();
      debouncedDummyFn();

      await wait(100);

      debouncedDummyFn();

      await wait(100);

      expect(result).toBe(2);
    });
  });
});
