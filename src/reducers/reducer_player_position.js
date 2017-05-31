import { PLAYER_POS_CHANGE } from '../actions/player_move_action';

export default function(state={}, action){
    // console.log(state, 'this is the state', 'this is the action', action.payload);
    switch(action.type){
        case PLAYER_POS_CHANGE:
        return action.payload
    }
    return state;
}