import { PLAYER_INFO_CHANGE } from '../actions/player_move_action';

export default function(state={}, action){
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
        let level = JSON.parse(JSON.stringify(action.payload.level));
        let key = action.payload.key;
        let currentPlace = JSON.parse(JSON.stringify(action.payload.currentPlace));
        let oldPos = JSON.parse(JSON.stringify(player.position));
        let neighbors = getNeighbors(currentPlace, level.paths, level.rooms);
        player.neighbors = neighbors;
        let vel = player.velocity;
        let initialVel = action.payload.initialVel;
        if(vel > 0){
            vel = vel - 0.55 * player.elem.deceleration;
            if(vel < 0){
                vel = 0;
            }
        } else {
            if(key !== 'start'){
                vel = 0;
            }
        }
        if(key === 'start'){
            vel = initialVel;
        } 

        let newPos = changePosition(key, oldPos, vel);

        // console.log("newPos", newPos);
        player.velocity = newPos.vel;
        //playerbox is for the new position
        let playerBox = makeCorners(newPos.pos, player.radius);
        let collision = handleCollision(playerBox, newPos.pos, currentPlace, neighbors);
        //STEP FOR HANDLING COLLISION
        // console.log(!collision.collided);
        if(!collision.collided && key !== 'start'){
            player.position = newPos.pos;
        }
        if(collision.isInsideNeighbor){
            player.location = collision.collideWithNeighbor[0];
            player.neighbors = getNeighbors(collision.collideWithNeighbor[0], level.paths, level.rooms);
        }
    } else {
        player = action.payload;
    }
    return player;
}

function changePosition(key, newPos, vel){
    
    switch(key){
        case 'ArrowUp':
        newPos.y -= vel;
        break
        case 'ArrowDown':
        newPos.y += vel;
        break
        case 'ArrowLeft':
        newPos.x -= vel;
        break
        case 'ArrowRight':
        newPos.x += vel;
    }

    return {pos: newPos, vel: vel};
}

function getNeighbors(location, paths, rooms){
    let connected = [];
    if(location.type === 'room'){
        connected = paths.filter(function(cor){return cor.connects.indexOf(location.index) !== -1});
    } else {
        let neightborCor = paths.filter(function(cor){
            if(checkOverlappingCorredors(cor, location) === true || checkOverlappingCorredors(location, cor) === true){
                return true;
            }
            return false
        })
        let neighborRooms = rooms.filter(function(room){
            return room.index === location.connects[0] || room.index === location.connects[1];
        });
        connected = neightborCor.concat(neighborRooms);
    }
    return connected;
}

function checkOverlappingCorredors(cor1, cor2){
    let c = cor1.corners;
    let c2 = cor2.corners;
    if(( (c.DL.X > c2.DL.X ) && (c.DR.X < c2.DR.X)) && ((c2.UL.Y > c.UL.Y ) && (c2.DL.Y < c.DL.Y))){
        return true;
    }
    return false;
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

function handleCollision(playerBox, newPos, currentPlace, neighbors){
    let collision = {
        collided: true,
        collideWithNeighbor: null,
        isInsideNeighbor: null
    };
    if(playerBox.UL.X >= currentPlace.corners.UL.X 
    && playerBox.UR.X <= currentPlace.corners.UR.X 
    && playerBox.UL.Y >= currentPlace.corners.UL.Y 
    && playerBox.DL.Y <= currentPlace.corners.DL.Y){
        collision.collided = false;
        return collision;
    }
    let cP = currentPlace.corners;
    let inNeighbor = neighbors.filter(function(neighbor){
        
        
        return filterNeighboors(neighbor, playerBox, currentPlace, collision, cP);
    });
    
    if(inNeighbor.length > 0){
        collision.collideWithNeighbor = inNeighbor;
        collision.isInsideNeighbor = checkOne(newPos, currentPlace);
    }

    return collision;
}

function filterNeighboors(neighbor, playerBox, currentPlace, collision, cP){
    let nC = neighbor.corners;
    if(neighbor.type === 'corridor' && currentPlace.type === 'room'){
        if(checkPair(playerBox, nC, 'UL', 'DL')){
            if((playerBox.UL.Y > nC.UR.Y && playerBox.DL.Y < nC.DR.Y)){
                collision.collided = false;
            } else {
                collision.collided = true;
            }
            return true;
        }
        if (checkPair(playerBox, nC, 'UL', 'UR') ){
            if((playerBox.UL.X > nC.DL.X && playerBox.UR.X < nC.DR.X)){
                collision.collided = false;
            } else {
                collision.collided = true;
            }
            return true;
        }
        if (checkPair(playerBox, nC, 'UR', 'DR')){
            if((playerBox.UR.Y > nC.UL.Y && playerBox.DR.Y < nC.DL.Y)){
                collision.collided = false;
            } else {
                collision.collided = true;
            }
            return true;
        }
        if (checkPair(playerBox, nC, 'DR', 'DL')){
            if((playerBox.DL.X > nC.UL.X && playerBox.DR.X < nC.UR.X)){
                collision.collided = false;
            } 
            return true;
        }
        return false;
    } else if (neighbor.type === 'room' && currentPlace.type === 'corridor') {
        //up side
        if(cP.UL.Y === nC.DL.Y && playerBox.UL.Y < cP.UL.Y){
            if(playerBox.UL.X > cP.UL.X && playerBox.UR.X < cP.UR.X){
                collision.collided = false;
            } else {
                collision.collided = true;
            }
            return true;
        }
        // down side
        if(cP.DL.Y === nC.UL.Y && playerBox.DL.Y > cP.DL.Y){
            if(playerBox.UL.X > cP.UL.X && playerBox.UR.X < cP.UR.X){
                collision.collided = false;
            } else {
                collision.collided = true;
            }
            return true;
        }
        if(cP.DL.X === nC.DR.X && playerBox.DL.X < cP.DL.X){
            if(playerBox.DL.Y < cP.DL.Y && playerBox.UL.Y > cP.UL.Y){
                collision.collided = false;
            } else {
                collision.collided = true;
            }
            return true;
        }
        if(cP.DR.X === nC.DL.X && playerBox.DR.X > cP.DR.X){
            if(playerBox.DL.Y < cP.DL.Y && playerBox.UL.Y > cP.UL.Y){
                collision.collided = false;
            } else {
                collision.collided = true;
            }
            return true;
        }
        return false;
    } else {
        return false;
    }
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
        return false;
    }
    return true;
}

function checkOneCorner(corner, corners){
    if(
           corner.X < corners.UR.X
        && corner.X > corners.UL.X
        && corner.Y > corners.UL.Y
        && corner.Y < corners.DL.Y
    ){
        return true;
    }
    return false;
}