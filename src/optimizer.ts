export type Task<Option, Payoff> = (option: Option) => Payoff;

export type Optimizer<Option, Payoff> = (task: Task<Option, Payoff>) => Set<Option>;

export type Quantifier<Option, Payoff> = (task: Task<Option, Payoff>) => Set<Payoff>;
