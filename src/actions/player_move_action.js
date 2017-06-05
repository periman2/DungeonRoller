export const PLAYER_INFO_CHANGE = 'PLAYER_INFO_CHANGE'

export function changePlayerInfo(info) {
    return {
        type: PLAYER_INFO_CHANGE,
        payload: info
    }
}