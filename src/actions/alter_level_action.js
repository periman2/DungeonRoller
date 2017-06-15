export const CHANGE_LEVEL = 'CHANGE_LEVEL'

export function changeLevels(action){
    return {
        type: CHANGE_LEVEL,
        payload: action
    }
}