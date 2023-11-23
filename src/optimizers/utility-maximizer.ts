import { 
    Optimizer, Task
} from '../optimizer';

export const utilityMaximizerName = "Utility Maximizer";

//This assumes that payoffs will come in the form of an array of numbers
//This returns an optimizer which maximizes the payoff at the given index
export function getUtilitityMaximizer<Option>(playerIndex: number, options: Option[]): 
        Optimizer<Option, number[]> {
    return (task: Task<Option, number[]>) => {
        let maxPayoff = Number.NEGATIVE_INFINITY;
        let optimalOptions = new Set<Option>();

        options.forEach((option: Option) => {
            const jointPayoff = task(option);
            const playerPayoff = jointPayoff[playerIndex];

            if (playerPayoff > maxPayoff) {
                //The current option is better than any discovered so far
                optimalOptions.clear();
                optimalOptions.add(option);

                maxPayoff = playerPayoff;
            }else if (playerPayoff === maxPayoff) {
                //The current option is as good as the best discovered so far
                optimalOptions.add(option);
            }
        });

        return optimalOptions;
    }
}