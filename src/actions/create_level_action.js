export const MAKE_LEVEL = 'MAKE_LEVEL';

export function makeNewLevel(level) {
    return {
        type: MAKE_LEVEL,
        payload: level
    }
}