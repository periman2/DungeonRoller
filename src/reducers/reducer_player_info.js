import { PLAYER_INFO_CHANGE } from '../actions/player_move_action';

export default function(state={}, action){
    // console.log(state, 'this is the state', 'this is the action', action.payload);
    
    // console.log(state.position);
    switch(action.type){
        case PLAYER_INFO_CHANGE:
        let player = positionEdit(action, state);
        return player
    }
    return state;
}

//PHYSICS ENGINE HERE
function positionEdit(action, state){
    let player = JSON.parse(JSON.stringify(state));
    if(state.position){
        console.log('state', state);
        let key = action.payload.key;
        let amount = action.payload.amount;
        let currentPlace = JSON.parse(JSON.stringify(action.payload.currentPlace));
        let oldPos = JSON.parse(JSON.stringify(player.position));
        let newPos = JSON.parse(JSON.stringify(player.position));
        
        switch(key){
            case 'ArrowUp':
            newPos.y -= amount;
            break
            case 'ArrowDown':
            newPos.y += amount;
            break
            case 'ArrowLeft':
            newPos.x -= amount;
            break
            case 'ArrowRight':
            newPos.x += amount;
        }
        //STEP FOR HANDLING COLLISION
        let isCollided = handleCollision(player, newPos, oldPos, currentPlace);
        let leftTheRoom = checkOne(newPos, currentPlace);
        if(isCollided[0] !== 'col'){
            player.position = newPos;
        }
    } else {
        player = action.payload;
    }
    return player;
}

function handleCollision(player, newPos, oldPos, currentPlace) {
    // console.log(player);
    let neighbors = player.neighbors;
    let playerBox = makeCorners(newPos, player.radius);
    let isColided = checkCorners(playerBox, currentPlace.corners, neighbors);
    return isColided;
}

function makeCorners(pos, rad){
    let corners = {
        UL: {X: pos.x - rad, Y: pos.y - rad},
        UR: {X: pos.x + rad, Y: pos.y - rad},
        DR: {X: pos.x + rad, Y: pos.y + rad},
        DL: {X: pos.x - rad, Y: pos.y + rad}
    }
    return corners;
}

function checkCorners(playerBox, currentPlace, neighbors){
    console.log(currentPlace);
    let inNeighbor = neighbors.filter(function(neighboor){
        let nC = neighboor.corners;
        if(checkPair(playerBox, nC, 'UL', 'DL') 
        || checkPair(playerBox, nC, 'UL', 'UR') 
        || checkPair(playerBox, nC, 'DR', 'UR') 
        || checkPair(playerBox, nC, 'DR', 'DL')) {
            return true;
        }
        return false;
    });
    if(inNeighbor.length > 0){
        return inNeighbor;
    }
    if(playerBox.UL.X > currentPlace.UL.X 
    && playerBox.UR.X < currentPlace.UR.X 
    && playerBox.UL.Y > currentPlace.UL.Y 
    && playerBox.DL.Y < currentPlace.DL.Y){
        return ['notCol'];
    }
    return ['col'];
}

function checkPair(playerBox, nC, c1, c2){
    if(
    playerBox[c1].X < nC.UR.X 
    && playerBox[c1].X > nC.UL.X 
    && playerBox[c1].Y > nC.UL.Y 
    && playerBox[c1].Y < nC.DL.Y
    && playerBox[c2].X < nC.UR.X 
    && playerBox[c2].X > nC.UL.X 
    && playerBox[c2].Y > nC.UL.Y 
    && playerBox[c2].Y < nC.DL.Y
    ){
        return true;
    }
    return false;
}

function checkOne(pos, currentPlace){
    if(
        pos.x < currentPlace.corners.UR.X
        && pos.x > currentPlace.corners.UL.X
        && pos.y > currentPlace.corners.UL.Y
        && pos.y < currentPlace.corners.DL.Y
    ){
        return true;
    }
    return false;
}
