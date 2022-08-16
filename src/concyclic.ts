export interface Point {
    readonly x: number;
    readonly y: number;
}

export type CircleInfo = {
    p1: Point,
    p2: Point,
    tangent: number,
};

export function tanInscribedAngle(a: Point, b: Point, c: Point) {
    const x = (c.x - a.x) * (c.x - b.x) + (c.y - a.y) * (c.y - b.y);
    const y = (c.y - a.y) * (c.x - b.x) - (c.x - a.x) * (c.y - b.y);
    return x === 0 ? Infinity : y / x;
}

export function countCircles(points: Point[]) {
    let discovered = 0;
    for (let i = 3; i < points.length; i++) {
        for (let j = 2; j < i; j++) {
            const tilts = points.slice(0, j).map(point => tanInscribedAngle(points[i], points[j], point));
            for (let k = 0; k < j; k++) {
                if (k !== tilts.indexOf(tilts[k])) continue;
                const multiplicity = tilts.filter(tilt => tilt === tilts[k]).length;
                if (multiplicity === 2) ++discovered;
                if (multiplicity === 3) --discovered;
            }
        }
    }
    return discovered;
}

export function* enumerateCircles(points: Point[]) {
    for (let i = points.length - 1; i >= 3; i--) {
        let found_circles = new Set();
        for (let j = i - 1; j >= 2; j--) {
            const tilts = points.slice(0, j).map(point => tanInscribedAngle(points[i], points[j], point));
            for (let k = j - 1; k >= 0; k--) {
                if (k !== tilts.indexOf(tilts[k])) continue;
                const indices = tilts.map((tilt, i) => tilt === tilts[k] ? i : -1).filter(i => i >= 0);
                if (indices.length === 2) {
                    if (!found_circles.has(indices[0] * i + indices[1]))
                        yield { p1: points[i], p2: points[j], tangent: tilts[k] };
                }
                if (indices.length === 3) {
                    found_circles.add(indices[0] * i + indices[1]);
                }
            }
        }
    }
}