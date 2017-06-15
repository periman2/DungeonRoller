import {MOVE_SCREEN} from '../actions/move_screen_action';

export default function moveScreen(state = {x: 0, y: 0}, action){
    switch(action.type){
        case MOVE_SCREEN:
        return action.payload;
    }
    return state;
}