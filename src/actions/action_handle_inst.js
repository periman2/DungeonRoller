export const HANDLE_INST = 'HANDLE_INST';

export default function changeInst(isOn){
    return {
        type: HANDLE_INST,
        payload: isOn
    }
}