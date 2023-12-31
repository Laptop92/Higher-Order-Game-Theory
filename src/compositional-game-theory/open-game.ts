import { cartesian2D } from '../utility';

import { 
    ConcreteLens, ViewFunction, composeConcreteLenses, 
    getBracketedLens, getCounitLens, getEffect, getObservation, 
    getOutcomeFunction, getState
} from './concrete-lens';

export type PlayFunction<OptionProfile, Observation, CoOutcome, Action, Outcome> = 
    (optionProfile: OptionProfile) => 
    ConcreteLens<Observation, CoOutcome, Action, Outcome>;

export type OutcomeFunction<Action, Outcome> = (action: Action) => Outcome;
export type Context<Observation, Action, Outcome> = {
    history: Observation, 
    getOutcome: OutcomeFunction<Action, Outcome>
}

//This defines a binary relation in terms of forward images
//i.e. given an x on the left, what is the list of X's that can appear on the right
export type BinaryRelation<X> = (x: X) => X[];

export type ConcreteBestResponseFunction<OptionProfile, Observation, Action, Outcome> = 
    (observation: Observation, outcomeFunction: OutcomeFunction<Action, Outcome>) => 
    BinaryRelation<OptionProfile>;

export type ConcreteOpenGame<OptionProfile, Observation, CoOutcome, Action, Outcome> = {
    optionProfiles: OptionProfile[]
    play: PlayFunction<OptionProfile, Observation, CoOutcome, Action, Outcome>
    bestResponse: ConcreteBestResponseFunction<OptionProfile, Observation, Action, Outcome>
}

export type SelectionFunction<OptionProfile, Observation, Action, Outcome> = 
    (observation: Observation, outcomeFunction: OutcomeFunction<Action, Outcome>) => 
        OptionProfile[];

export function getAtom<Observation, CoOutcome, Action, Outcome>(
        concreteLenses: ConcreteLens<Observation, CoOutcome, Action, Outcome>[], 
        selectionFunction: SelectionFunction<
            ConcreteLens<Observation, CoOutcome, Action, Outcome>, 
            Observation, Action, Outcome
        >): 
            ConcreteOpenGame<
                ConcreteLens<Observation, CoOutcome, Action, Outcome>, 
                Observation, CoOutcome, Action, Outcome
            > {
    const atom: ConcreteOpenGame<
            ConcreteLens<Observation, CoOutcome, Action, Outcome>, 
            Observation, CoOutcome, Action, Outcome
            > = {
        optionProfiles: concreteLenses, 
        play: (lens: ConcreteLens<Observation, CoOutcome, Action, Outcome>) => lens, 
        bestResponse: (observation: Observation, 
            outcomeFunction: OutcomeFunction<Action, Outcome>) => {
                return (lens: ConcreteLens<Observation, CoOutcome, Action, Outcome>) => 
                    selectionFunction(observation, outcomeFunction)
            }
    }

    return atom;
}

export function getComputation<Observation, CoOutcome, Action, Outcome>(
        chooseAction: ViewFunction<Observation, Action>, 
        propagate: (outcome: Outcome) => CoOutcome): 
            ConcreteOpenGame<
                ConcreteLens<Observation, CoOutcome, Action, Outcome>, 
                Observation, CoOutcome, Action, Outcome
            > {
    const concreteLenses = [getBracketedLens(chooseAction, propagate)];
    const selectionFunction = (observation: Observation, 
        outcomeFunction: OutcomeFunction<Action, Outcome>) => concreteLenses;

    const computation = getAtom(concreteLenses, selectionFunction);

    return computation;
}

export function getCounit<Observation, CoOutcome>(
        getCoOutcome: (observation: Observation) => CoOutcome): 
            ConcreteOpenGame<
                ConcreteLens<Observation, CoOutcome, {}, {}>, 
                Observation, CoOutcome, {}, {}
            > {
    const concreteLenses = [getCounitLens(getCoOutcome)];
    const selectionFunction = (observation: Observation, 
        outcomeFunction: OutcomeFunction<{}, {}>) => concreteLenses;

    const counit = getAtom(concreteLenses, selectionFunction);

    return counit;
}
/**
 * Computes h ∘ g
 * This corresponds to playing h sequentially after g
 * @param g A concrete open game
 * @param h A concrete open game
 * @returns The composed concrete open game h ∘ g
 */
export function composeConcreteOpenGames<OptionProfileG, X, S, Y, R, OptionProfileH, Z, Q>(
        g: ConcreteOpenGame<OptionProfileG, X, S, Y, R>, 
        h: ConcreteOpenGame<OptionProfileH, Y, R, Z, Q>): 
            ConcreteOpenGame<[OptionProfileG, OptionProfileH], X, S, Z, Q>{
    const composedOptionProfiles = cartesian2D(g.optionProfiles, h.optionProfiles);
    const composedPlay = (optionProfile: [OptionProfileG, OptionProfileH]) => 
        composeConcreteLenses(g.play(optionProfile[0]), h.play(optionProfile[1]));

    const composedBestResponse = (x: X, k: OutcomeFunction<Z, Q>) => {
        return (optionProfile: [OptionProfileG, OptionProfileH]) => {
            const state = getState(x);
            const effect = getEffect(k);

            const effectOfPlay = composeConcreteLenses(h.play(optionProfile[1]), effect);
            const playAfterState = composeConcreteLenses(state, g.play(optionProfile[0]));

            const gOutcomeFunction = getOutcomeFunction(effectOfPlay);
            const hObservation = getObservation(playAfterState);

            const gBestResponseRelation = g.bestResponse(x, gOutcomeFunction);
            const hBestResponseRelation = h.bestResponse(hObservation, k);

            const bestResponsesInG = gBestResponseRelation(optionProfile[0]);
            const bestResponsesInH = hBestResponseRelation(optionProfile[1]);

            const bestResponses = cartesian2D(bestResponsesInG, bestResponsesInH);

            return bestResponses;
        }
    };

    const composedConcreteOpenGame: ConcreteOpenGame<[OptionProfileG, OptionProfileH], X, S, Z, Q> = {
        optionProfiles: composedOptionProfiles, 
        play: composedPlay, 
        bestResponse: composedBestResponse
    }

    return composedConcreteOpenGame;
}