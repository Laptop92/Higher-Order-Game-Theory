import { OptionProfile } from '../game';
import { ConcreteLens } from './concrete-lens';

export type PlayFunction<Option, Observation, CoOutcome, Action, Outcome> = 
    (optionProfile: OptionProfile<Option>) => 
    ConcreteLens<Observation, CoOutcome, Action, Outcome>;

export type OutcomeFunction<Action, Outcome> = (action: Action) => Outcome;

export type ConcreteBestResponseFunction<Option, Observation, Action, Outcome> = 
    (observation: Observation, outcomeFunction: OutcomeFunction<Action, Outcome>) => 
    Set<[OptionProfile<Option>, OptionProfile<Option>]>


