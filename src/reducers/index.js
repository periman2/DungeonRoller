import { combineReducers } from 'redux';
import GameInfo from './game-info';
import Player from './reducer_player_info';
import Levels from './reducer_new_level';
import Elements from './reducer_elements';

const rootReducer = combineReducers({
  gameInfo: GameInfo,
  player: Player,
  levels: Levels,
  elements: Elements
});

export default rootReducer;
