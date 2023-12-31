export type ViewFunction<X, Y> = (x: X) => Y;
export type UpdateFunction<X, R, S> = (x: X, r: R) => S;

export type ConcreteLens<X, S, Y, R> = {
    view: ViewFunction<X, Y>
    update: UpdateFunction<X, R, S>
}

/**
 * Computes t ∘ l
 * @param l A concrete lens
 * @param t A concrete lens
 * @returns The composed concrete lens t ∘ l
 */
export function composeConcreteLenses<X, S, Y, R, Z, Q>(l: ConcreteLens<X, S, Y, R>, 
        t: ConcreteLens<Y, R, Z, Q>): ConcreteLens<X, S, Z, Q> {
    const composedView = (x: X) => t.view(l.view(x));
    const composedUpdate = (x: X, q: Q) => {
        const y = l.view(x);
        const r = t.update(y, q);
        const s = l.update(x, r);
        
        return s;
    }

    const composedConcreteLens = {
        view: composedView, 
        update: composedUpdate
    }

    return composedConcreteLens;
}

/**
 * Computes lens1 ⊗ lens2
 * @param lens1 A concrete lens
 * @param lens2 A concrete lens
 * @returns The concrete lens lens1 ⊗ lens2
 */
export function tensorConcreteLenses<X1, S1, Y1, R1, X2, S2, Y2, R2>(
        lens1: ConcreteLens<X1, S1, Y1, R1>, 
        lens2: ConcreteLens<X2, S2, Y2, R2>): 
            ConcreteLens<[X1, X2], [S1, S2], [Y1, Y2], [R1, R2]> {
    const tensorView = (x: [X1, X2]) => {
        const y: [Y1, Y2] = [lens1.view(x[0]), lens2.view(x[1])];

        return y
    }

    const tensorUpdate = (x: [X1, X2], r: [R1, R2]) => {
        const s: [S1, S2] = [lens1.update(x[0], r[0]), lens2.update(x[1], r[1])];
        
        return s;
    }

    const tensorConcreteLens = {
        view: tensorView, 
        update: tensorUpdate
    }

    return tensorConcreteLens;
}