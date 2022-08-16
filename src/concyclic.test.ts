import { countCircles } from "./concyclic";

describe("countCircles", () => {
    test("simplest case", () => {
        expect(countCircles([
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 }
        ])).toBe(1);
    });
});
