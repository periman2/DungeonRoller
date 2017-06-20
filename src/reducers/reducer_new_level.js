import {MAKE_LEVEL} from '../actions/create_level_action';
import {CHANGE_LEVEL} from '../actions/alter_level_action';

export default function NewLevel(state = [], action){
    switch(action.type){
        case MAKE_LEVEL:
        return [action.payload, ...state];
        case CHANGE_LEVEL:
        return action.payload
    }
    return state;
}