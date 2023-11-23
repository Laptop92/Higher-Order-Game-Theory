import './App.css';

import {
  CDTPlayerDeviationMapConstructor, BestResponseConstructor_v0, 
  getAllOptionProfiles, findNashEquilibriaByBruteForce
} from './game';

import { 
  PrisonersDilemmaPlayer, PrisonersDilemmaOption, 
  prisonersDilemmaOptions, PrisonersDilemma_v0
} from './games/prisoners-dilemma';

import { 
  //utilityMaximizerName, 
  getUtilitityMaximizer 
} from './optimizers/utility-maximizer';

const games = [PrisonersDilemma_v0];
//const optimizerNames = [utilityMaximizerName];

function App() {
  //TODO: Let the user select this
  const game = games[0];

  //TODO: Let the user select these
  const optimizer0 = getUtilitityMaximizer(0, prisonersDilemmaOptions);
  const optimizer1 = getUtilitityMaximizer(1, prisonersDilemmaOptions);

  const optimizers = [optimizer0, optimizer1];

  const playerDeviationMapConstructor = 
    new CDTPlayerDeviationMapConstructor<PrisonersDilemmaOption>();

  const bestResponseConstructor = 
    new BestResponseConstructor_v0<PrisonersDilemmaPlayer, PrisonersDilemmaOption, number[]>();

  const players = game.getPlayers();

  const bestResponseFunction = bestResponseConstructor.getBestResponseFunction(
    players, optimizers, 
    game.getPayoff, playerDeviationMapConstructor.getPlayerDeviationMap
  );
  
  const allOptionsForAllPlayers = players.map(game.getOptions);
  const allOptionProfiles = getAllOptionProfiles(...allOptionsForAllPlayers);

  const nashEquilibria = findNashEquilibriaByBruteForce(allOptionProfiles, 
    bestResponseFunction);
  const nashEquilibriaArray = [...nashEquilibria];

  const playersString = JSON.stringify(players);
  const allOptionsForAllPlayersString = JSON.stringify(allOptionsForAllPlayers);
  const allOptionProfilesString = JSON.stringify(allOptionProfiles);
  const nashEquilibriaString = JSON.stringify(nashEquilibriaArray);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Players: {playersString} 
          <br/>
          All Options for All Players: {allOptionsForAllPlayersString} 
          <br/>
          All Option Profiles: {allOptionProfilesString}
          <br/>
          Nash Equilibria: {nashEquilibriaString}
        </p>
      </header>
    </div>
  );
}

export default App;
