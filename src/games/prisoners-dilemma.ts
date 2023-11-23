import { 
    GetPayoff, GameFromConstants_v0 
} from '../game';

export const prisonersDilemmaName = "Prisoners' Dilemma";

export const PrisonersDilemmaPlayerArray = ["Row", "Column"] as const;
export type PrisonersDilemmaPlayer = typeof PrisonersDilemmaPlayerArray[number];
export const prisonersDilemmaPlayers: PrisonersDilemmaPlayer[] = [...PrisonersDilemmaPlayerArray];

export const PrisonersDilemmaOptionArray = ["Cooperate", "Defect"] as const;
export type PrisonersDilemmaOption = typeof PrisonersDilemmaOptionArray[number];

export const prisonersDilemmaOptions: PrisonersDilemmaOption[] = [...PrisonersDilemmaOptionArray];
export const getPrisonersDilemmaOptions = 
    (player: PrisonersDilemmaPlayer) => prisonersDilemmaOptions;

export const getPrisonersDilemmaPayoff: GetPayoff<PrisonersDilemmaOption, number[]> = 
        (optionProfile) => {
    if (optionProfile[0] === "Cooperate") {
        if (optionProfile[1] === "Cooperate") {
            return [2, 2];
        }else{
            return [0, 3]
        }
    }else{
        if (optionProfile[1] === "Cooperate") {
            return [3, 0];
        }else{
            return [1, 1]
        }
    }
}

export const PrisonersDilemma_v0 = new GameFromConstants_v0
        <PrisonersDilemmaPlayer, PrisonersDilemmaOption, number[]>(
    prisonersDilemmaName, prisonersDilemmaPlayers, 
    getPrisonersDilemmaOptions, getPrisonersDilemmaPayoff
);