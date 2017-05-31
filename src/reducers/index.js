import { combineReducers } from 'redux';
import GameInfo from './game-info';
import PlayerPosition from './reducer_player_position';

const rootReducer = combineReducers({
  gameInfo: GameInfo,
  playerPosition: PlayerPosition
});

export default rootReducer;
