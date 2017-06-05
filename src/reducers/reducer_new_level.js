import {MAKE_LEVEL} from '../actions/create_level_action';

export default function NewLevel(state = [], action){
    switch(action.type){
        case MAKE_LEVEL:
        return [action.payload, ...state];
    }
    return state;
}