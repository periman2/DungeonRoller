export const MOVE_SCREEN = 'MOVE_SCREEN';

export function MoveScreen(screen){
    return {
        type: MOVE_SCREEN,
        payload: screen
    }
}