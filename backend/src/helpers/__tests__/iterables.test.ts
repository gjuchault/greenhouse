import { keyBy } from "../iterables";

describe("keyBy()", () => {
  describe("when called with an input array", () => {
    const input = [
      { id: "a", name: "some a" },
      { id: "b", name: "some b" },
    ];

    let result: Map<
      string,
      {
        id: string;
        name: string;
      }
    >;

    beforeAll(() => {
      result = keyBy(input, ({ id }) => id);
    });

    it("returns a Map indexed by the key", () => {
      expect(result).toBeInstanceOf(Map);
      expect(result.get("a")).toEqual({ id: "a", name: "some a" });
      expect(result.get("b")).toEqual({ id: "b", name: "some b" });
      expect(Array.from(result.keys())).toEqual(["a", "b"]);
    });
  });
});
