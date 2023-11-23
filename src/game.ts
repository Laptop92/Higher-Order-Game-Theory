import { Optimizer } from './optimizer';

import { 
    cartesian, intersectionOfAll, deepSetContains
} from './utility';

export type OptionProfile<Option> = Option[];
export type GetPayoff<Option, Payoff> = (optionProfile: OptionProfile<Option>) => Payoff;

export type PlayerDeviationMap<Option> = (optionProfile: OptionProfile<Option>) => 
    ((option: Option) => OptionProfile<Option>);

export type BestResponseFunction<Option> = (optionProfile: OptionProfile<Option>) => 
    Set<OptionProfile<Option>>;

export interface HasName {
    getName: () => string;
}

export interface HasPlayers<Player> {
    getPlayers: () => Player[];
}

export interface HasOptionsForPlayers<Player, Option> {
    getOptions: (player: Player) => Option[];
}

export interface HasPayoffsForOptionProfiles<Option, Payoff> {
    getPayoff: GetPayoff<Option, Payoff>;
}

export interface HasPlayerDeviationMap<Option> {
    getPlayerDeviationMap: (playerIndex: number) => PlayerDeviationMap<Option>;
}

export interface HasBestResponseFunction<Player, Option, Payoff> {
    getBestResponseFunction: (players: Player[],
        optimizers: Optimizer<Option, Payoff>[], 
        getPayoff: GetPayoff<Option, Payoff>,
        getPlayerDeviationMap: HasPlayerDeviationMap<Option>["getPlayerDeviationMap"]) => 
            BestResponseFunction<Option>
}

export class Game_v0<Player, Option, Payoff> implements HasPlayers<Player>, 
        HasOptionsForPlayers<Player, Option>, HasPayoffsForOptionProfiles<Option, Payoff> {
    getName: HasName["getName"];
    getPlayers: HasPlayers<Player>["getPlayers"];
    getOptions: HasOptionsForPlayers<Player, Option>["getOptions"];
    getPayoff: HasPayoffsForOptionProfiles<Option, Payoff>["getPayoff"];

    constructor(getName: HasName["getName"], 
            getPlayers: HasPlayers<Player>["getPlayers"], 
            getOptions: HasOptionsForPlayers<Player, Option>["getOptions"], 
            getPayoff: HasPayoffsForOptionProfiles<Option, Payoff>["getPayoff"]) {
        this.getName = getName;
        this.getPlayers = getPlayers;
        this.getOptions = getOptions;
        this.getPayoff = getPayoff;
    }
}

export class GameFromConstants_v0<Player, Option, Payoff> extends Game_v0<Player, Option, Payoff> {
    constructor(name: string, 
            players: Player[], 
            getOptions: HasOptionsForPlayers<Player, Option>["getOptions"], 
            getPayoff: HasPayoffsForOptionProfiles<Option, Payoff>["getPayoff"]) {
        const getName = () => name;
        const getPlayers = () => players;

        super(getName, getPlayers, getOptions, getPayoff);
    }
}

export class CDTPlayerDeviationMapConstructor<Option> implements HasPlayerDeviationMap<Option> {
    getPlayerDeviationMap(playerIndex: number): PlayerDeviationMap<Option> {
        return function (optionProfile: OptionProfile<Option>) {
            return function (option: Option) {
                let deviatedOptionProfile = [...optionProfile];
                deviatedOptionProfile[playerIndex] = option;

                return deviatedOptionProfile
            }
        }
    }
}

export class BestResponseConstructor_v0<Player, Option, Payoff> implements 
        HasBestResponseFunction<Player, Option, Payoff> {
    getBestResponseFunction (players: Player[],
            optimizers: Optimizer<Option, Payoff>[], 
            getPayoff: GetPayoff<Option, Payoff>,
            getPlayerDeviationMap: HasPlayerDeviationMap<Option>["getPlayerDeviationMap"]): 
                BestResponseFunction<Option> {
        return function (optionProfile: OptionProfile<Option>) {
            const profilesUsingBestResponses = players.map(
                    (player: Player, playerIndex: number) => {
                const playerDeviationMap = getPlayerDeviationMap(playerIndex);

                function playerTask(option: Option){
                    const deviatedProfile = playerDeviationMap(optionProfile)(option);
                    const payoff = getPayoff(deviatedProfile);

                    return payoff
                }

                const optimizer = optimizers[playerIndex];
                const optimizerBestResponses = optimizer(playerTask);

                const profilesUsingPlayerBestResponses = 
                    new Set([...optimizerBestResponses].map((bestResponse) => 
                        playerDeviationMap(optionProfile)(bestResponse)));

                return profilesUsingPlayerBestResponses;
            });

            const bestResponseProfiles = intersectionOfAll(...profilesUsingBestResponses);

            return bestResponseProfiles;
        }
    }
}

export function isNashEquilibrium<Option>(optionProfile: OptionProfile<Option>, 
        bestResponseFunction: BestResponseFunction<Option>): boolean {
    const bestResponsesToOptionProfile = bestResponseFunction(optionProfile);
    const optionProfileIsMutualBestResponse = 
        deepSetContains(bestResponsesToOptionProfile, optionProfile);

    return optionProfileIsMutualBestResponse;
}

//Returns the cartesian product of all option spaces
export function getAllOptionProfiles<Option>(...allOptions: Option[][]): OptionProfile<Option>[] {
    return cartesian(...allOptions);
}

//Iterates over all option profiles and returns the ones that are Nash Equilibria
//This does not eliminate dominated options or perform any other optimizations
export function findNashEquilibriaByBruteForce<Option>(allOptionProfiles: OptionProfile<Option>[], 
        bestResponseFunction: BestResponseFunction<Option>): Set<OptionProfile<Option>> {
    const nashEquilibria = new Set<OptionProfile<Option>>();

    allOptionProfiles.forEach((optionProfile: OptionProfile<Option>) => {
        if(isNashEquilibrium(optionProfile, bestResponseFunction)){
            nashEquilibria.add(optionProfile);
        }
    });

    return nashEquilibria;
}