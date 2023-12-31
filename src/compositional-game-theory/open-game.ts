import { 
    ConcreteLens, ViewFunction, getBracketedLens, getCounitLens
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

    const computation = getAtom(concreteLenses, selectionFunction);

    return computation;
}