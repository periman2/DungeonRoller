import {HANDLE_INST} from '../actions/action_handle_inst';

export default function handleInst(state = {on: true}, action){
    switch(action.type){
        case HANDLE_INST:
        return action.payload;
    }
    return state;
}