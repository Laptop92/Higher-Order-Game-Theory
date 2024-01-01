import { OutcomeFunction } from "./concrete-open-game";

export type ViewFunction<X, Y> = (x: X) => Y;
export type UpdateFunction<X, R, S> = (x: X, r: R) => S;
export type Singleton = {};

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

export function getState<X, S>(x: X): ConcreteLens<{}, {}, X, S>{
    const state: ConcreteLens<{}, {}, X, S> = {
        view: (o: {}) => x,
        update: (o: {}, s: S) => {return {}}
    }

    return state;
}

export function getEffect<Y, R>(outcomeFunction: (y: Y) => R): ConcreteLens<Y, R, {}, {}>{
    const effect: ConcreteLens<Y, R, {}, {}> = {
        view: (y: Y) => {return {}},
        update: (y: Y, o: {}) => {return outcomeFunction(y)}
    }

    return effect;
}

/**
 * Returns the underlying observation from a state
 * @param state 
 * @returns The observation that the lens views
 */
export function getObservation<X, S>(state: ConcreteLens<{}, {}, X, S>): X{
    const x = state.view({});

    return x;
}

/**
 * Returns the underlying observation from a state
 * @param state 
 * @returns The observation that the lens views
 */
export function getOutcomeFunction<Y, R>(effect: ConcreteLens<Y, R, {}, {}>): 
        OutcomeFunction<Y, R>{
    const outcomeFunction = (y: Y) => {
        return effect.update(y, {});
    }

    return outcomeFunction;
}

export function getComputationalLens<X, S, Y, R>(
        view: ViewFunction<X, Y>, propagate: (r: R) => S): 
            ConcreteLens<X, S, Y, R> {
    const computationalLens = {
        view: view, 
        update: (x: X, r: R) => propagate(r)
    }

    return computationalLens;
}

export function viewIntoSingleton<X>(x: X): Singleton {
    return {};
}

export function getCounitLens<X, S>(
        getCoOutcome: (x: X) => S): 
            ConcreteLens<X, S, {}, {}> {
    const counitLens = {
        view: viewIntoSingleton, 
        update: (x: X, r: Singleton) => getCoOutcome(x)
    }

    return counitLens;
}