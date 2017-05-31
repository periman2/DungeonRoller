export const PLAYER_POS_CHANGE = 'PLAYER_POS_CHANGE'

export function changePlayerPosition(position) {
    return {
        type: PLAYER_POS_CHANGE,
        payload: position
    }
}