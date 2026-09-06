/**
 * Cubic Bezier easing solver
 * --------------------------
 * For animation easing, input is x (time progress), and output is y (eased progress).
 * So for each x:
 *   1) solve Bx(t) = x   --> find t
 *   2) compute y = By(t)
 *
 * Solve Bx(t) = x with Newton-Raphson for speed.
 * If Newton is unstable (small slope / out-of-range / poor convergence), fallback to binary subdivision (bisection).
 */

export type EasingFunction = (x: number) => number;

const NEWTON_ITERATIONS = 8;
const NEWTON_MIN_SLOPE = 1e-7;
const SUBDIVISION_MAX_ITERATIONS = 12;
const SUBDIVISION_PRECISION = 1e-7;

function clamp01(v: number): number {
    if (v <= 0) return 0;
    if (v >= 1) return 1;
    return v;
}

/**
 * Cubic bezier polynomial coefficients for:
 *   B(t) = ((A * t + B) * t + C) * t
 *
 * Derived from control points with fixed endpoints:
 *   P0 = 0, P1 = a1, P2 = a2, P3 = 1
 */
function A(a1: number, a2: number): number {
    return 1 - 3 * a2 + 3 * a1;
}

function B(a1: number, a2: number): number {
    return 3 * a2 - 6 * a1;
}

function C(a1: number): number {
    return 3 * a1;
}

function calcBezier(t: number, a1: number, a2: number): number {
    return ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
}

/**
 * First derivative dB/dt at t.
 * Used by Newton-Raphson:
 *   t_{n+1} = t_n - (B(t_n) - x) / B'(t_n)
 */
function getSlope(t: number, a1: number, a2: number): number {
    return 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);
}

/**
 * Robust fallback root-finding by bisection.
 * Finds t in [a,b] where calcBezier(t, x1, x2) ~= x.
 */
function binarySubdivide(x: number, a: number, b: number, x1: number, x2: number): number {
    let currentT = 0;
    let currentX = 0;

    for (let i = 0; i < SUBDIVISION_MAX_ITERATIONS; i++) {
        currentT = a + (b - a) / 2;
        currentX = calcBezier(currentT, x1, x2) - x;

        if (Math.abs(currentX) <= SUBDIVISION_PRECISION) {
            return currentT;
        }

        if (currentX > 0) {
            b = currentT;
        } else {
            a = currentT;
        }
    }

    return currentT;
}

function newtonRaphsonIterate(x: number, guessT: number, x1: number, x2: number): number {
    let t = guessT;

    for (let i = 0; i < NEWTON_ITERATIONS; i++) {
        const slope = getSlope(t, x1, x2);

        if (Math.abs(slope) < NEWTON_MIN_SLOPE) {
            return t;
        }

        const currentX = calcBezier(t, x1, x2) - x;
        t -= currentX / slope;
    }

    return t;
}

/**
 * Create easing function equivalent to CSS cubic-bezier(x1, y1, x2, y2).
 * Solves x(t)=x with Newton-Raphson, with binary subdivision fallback.
 */
export function createCubicBezierEasing(x1: number, y1: number, x2: number, y2: number): EasingFunction {
    if (![x1, y1, x2, y2].every(Number.isFinite)) {
        throw new Error('Invalid cubic-bezier control points');
    }

    // Clamp for resilience (UI already enforces this).
    const cx1 = clamp01(x1);
    const cx2 = clamp01(x2);

    return (x: number): number => {
        const clampedX = clamp01(x);

        if (clampedX === 0) return 0;
        if (clampedX === 1) return 1;

        let t = clampedX; // Initial guess

        // 1) Try Newton first
        t = newtonRaphsonIterate(clampedX, t, cx1, cx2);

        // 2) If invalid or not accurate enough, fallback to bisection.
        if (!Number.isFinite(t) || t < 0 || t > 1) {
            t = binarySubdivide(clampedX, 0, 1, cx1, cx2);
        } else {
            const error = Math.abs(calcBezier(t, cx1, cx2) - clampedX);
            if (error > SUBDIVISION_PRECISION) {
                t = binarySubdivide(clampedX, 0, 1, cx1, cx2);
            }
        }

        return calcBezier(t, y1, y2);
    };
}