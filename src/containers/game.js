import React , { Component } from 'react';
import { connect } from 'react-redux';
import { changePlayerInfo } from '../actions/player_move_action';
import { makeNewLevel } from '../actions/create_level_action';
import { bindActionCreators } from 'redux';


class Game extends Component {
    constructor(props){
        super(props);
        this.renderPosition = this.renderPosition.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.buildRooms = this.buildRooms.bind(this);
        this.checkOverlap = this.checkOverlap.bind(this);
        this.getAllCorners = this.getAllCorners.bind(this);
        this.findIfNotInside = this.findIfNotInside.bind(this);
        this.buildPaths = this.buildPaths.bind(this);
        this.findConnectedRooms = this.findConnectedRooms.bind(this);
        this.makeCorridors = this.makeCorridors.bind(this);
        this.mergeCorridors = this.mergeCorridors.bind(this);
        this.getInitialPosition = this.getInitialPosition.bind(this);
        this.getNeighbors = this.getNeighbors.bind(this);
        this.addElementsAndWalls = this.addElementsAndWalls.bind(this);
        this.createBeginning = this.createBeginning.bind(this);
        this.drawShrines = this.drawShrines.bind(this);
        this.drawWall = this.drawWall.bind(this);
        this.makeSpecialTraps = this.makeSpecialTraps.bind(this);
    }
    renderPosition() {
        let ctx = this.getCanvas();
        if(!ctx) {
            return null;
        }
        // ctx.clearRect(0, 0, width, height);

        const width = this.props.gameInfo.canvasWidth;
        const height = this.props.gameInfo.canvasHeight;
        let CorWidth = this.props.gameInfo.coredorWidth;
        let dim = {
            x: this.props.player.position.x,
            y: this.props.player.position.y,
            r: this.props.gameInfo.radius
        }
        let fill = this.props.player.currentTexture;
        ctx.beginPath();
        ctx.arc(dim.x, dim.y, dim.r, 0, 2 * Math.PI);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.closePath();
        // console.log('this is the player', this.props.player)
    }
    buildRooms(levelIndex){
        let ctx = this.getCanvas();
        if(!ctx) {
            return null;
        }
        let rooms = [];
        const width = this.props.gameInfo.canvasWidth;
        const height = this.props.gameInfo.canvasHeight;
        var roomIndex = 0;
        ctx.clearRect(0, 0, width, height);
        
        let density = this.props.gameInfo.roomDensity;
        for(let i = 0; i < density; i ++){
            let newRoom = {}
            newRoom.boxWidth = this.getRandomDimention(width);
            newRoom.boxHeight = this.getRandomDimention(height);
            newRoom.X = this.getRandomDimention(width, 'start');
            newRoom.Y = this.getRandomDimention(height, 'start');
            if(rooms.length > 0){
                let isOverlap = this.checkOverlap(newRoom, rooms, width, height);
                if(isOverlap){
                    newRoom = this.makeRoomAttributes(newRoom, roomIndex, 'room');
                    rooms.push(newRoom);
                    //TEMPORARILY DRAW THE ROOMS
                    this.drawBox(newRoom);
                    roomIndex ++;
                }
            } else {
                //if there is no room craeted then create one
                newRoom = this.makeRoomAttributes(newRoom, roomIndex, 'room');
                //TEMPORARILY DRAW THE ROOMS
                this.drawBox(newRoom);
                rooms.push(newRoom);
                roomIndex ++;
            }
        }
        // Build the coridors that connect the boxes
        let paths = this.buildPaths(rooms, width, height);
        // INITIATE WITH THE MOST LEFT ROOM AS STARTING POINT
        let leftRoom = this.sortFoundRooms(rooms, 'Y')[0];
        leftRoom = this.createBeginning(leftRoom, levelIndex);
        // CREATE THE ROOMS THAT CONTAIN WALLS AND THE ONE THAT HAS THE POWERUP
        
        let level = {rooms: rooms, paths: paths, beginning: leftRoom, index: levelIndex};
        level = this.addElementsAndWalls(leftRoom.index, level, levelIndex)
        console.log('level with walls', level);
        this.props.makeNewLevel(level); 
        
               
        this.getInitialPosition(level, leftRoom);
        // this.addElementsAndWalls(leftRoom.index, level, levelIndex);
        this.drawShrines(leftRoom);
        

        return rooms;
    }
    drawShrines(room){
        let shrines = room.shrines;
        if(shrines.length > 0){
            for(var i = 0; i < shrines.length; i++){
                this.drawBox(shrines[i], this.choseShrineColor(shrines[i]))
            }
        }
    }
    makeRoomAttributes(room, index, roomType){
        room.index = index;
        room.type = roomType;
        room.traps = [];
        room.shrines = [];
        if(roomType === 'room'){
            room.walls = [];
            room.elements = [];
        }
        return room;
    }
    //get back to this later
    addElementsAndWalls(leftIndex, level, levelIndex){
        // console.log(leftIndex, level);
        let rooms = level.rooms;
        let randomRooms = rooms.reduce((prevRoom, r) => {
            //if the index is less than half the population
            if(r.index !== leftIndex && r.index < rooms.length / 2){
                return prevRoom.concat(r);
            }
            return prevRoom;
        }, []);
        console.log('these are the chosen rooms', randomRooms);
        for(var i = 0; i < randomRooms.length; i ++){
            let room = randomRooms[i];
            let neighbors = this.getNeighbors(room, level.paths, rooms);
            //For the first levelindex rooms do a walls that correspond to the elements order
            let type = '';
            if(i < levelIndex){
                type = this.chooseWallType(i);
            } else {
                type = 'rockWall'
            }
            let trapsAndElements = this.makeSpecialTraps(room);
            let traps = trapsAndElements[0];
            let elem = trapsAndElements[1];
            elem = this.chooseElem(type, elem, this.props.elements);

            this.drawBox(elem, this.chooseElemColor(elem))
            traps.map((t) => {this.drawBox(t, '#4f4c4a')});
            for(var j = 0; j < neighbors.length; j++){
                let wall = this.makeWalls(neighbors[j], room, this.props.gameInfo.radius)
                wall.type = type;
                room.walls.push(wall);
                this.drawWall(wall);
            }
            // level.rooms[room.index] = room
        }
        return level;
    }
    chooseElemColor(elem){
        let color = '';
        switch(elem.type.name){
            case 'neutral':
            color = '#c2aa9e';
            break;
            case 'fire':
            color = 'red';
            break;
            case 'ice':
            color = 'blue';
            break;
            case 'steel':
            color = 'grey';
            break;
            case 'diamond':
            color = 'white';
            break;
            default: color = '#c2aa9e'
        }
        return color;
    }
    chooseElem(type, elem, allElements){
        switch(type){
            case 'rockWall':
            elem.type = allElements.fire;
            break;
            case 'iceWall':
            elem.type = allElements.ice;
            break;
            case 'steelWall':
            elem.type = allElements.steel;
            break;
            case 'diamondWall':
            elem.type = allElements.diamond;
            break;
            default:
            elem.type = allElements.neutral
        }
        return elem
    }
    makeSpecialTraps(room){
        let randNum = 0.62 - Math.random() * 0.22;
        let reverseRandNum = 1 - randNum;
        let rad = this.props.gameInfo.radius;
        if(Math.random() > 0.5){
            let trap1 = {
                X: room.X + room.boxWidth * 0.20,
                Y: room.Y + room.boxHeight * 0.20,
                boxWidth: rad * 2 + rad * 3 * Math.random(),
                boxHeight: room.boxHeight * 0.6
            }

            let trap2 = {
                X: trap1.X + trap1.boxWidth,
                Y: trap1.Y,
                boxWidth: room.boxWidth * 0.6 - trap1.boxWidth,
                boxHeight: randNum * trap1.boxHeight - rad,
            }

            let trap3 = {
                X: trap2.X,
                Y: trap2.Y + trap2.boxHeight + rad* 2,
                boxWidth: trap2.boxWidth,
                boxHeight: reverseRandNum * trap1.boxHeight - rad
            }

            let element = {
                X: trap2.X,
                Y: trap2.Y + trap2.boxHeight,
                boxHeight: rad * 2,
                boxWidth: rad * 2
            }
            return [[trap1, trap2, trap3], element];
        } else {
            let rand = rad * 2 + rad * 3 * Math.random();

            let trap1 = {
                X: room.X + room.boxWidth * 0.20,
                Y: room.Y + room.boxHeight * 0.20,
                boxWidth: room.boxWidth * 0.6 - (rand),
                boxHeight: randNum * room.boxHeight * 0.6 - rad,
            }

            let trap2 = {
                X: trap1.X,
                Y: trap1.Y + trap1.boxHeight + rad * 2,
                boxWidth: trap1.boxWidth,
                boxHeight: reverseRandNum * room.boxHeight * 0.6 - rad
            }

            let trap3 = {
                X: trap1.X + trap1.boxWidth,
                Y: trap1.Y,
                boxWidth: rand,
                boxHeight: room.boxHeight * 0.6
            }

            let element = {
                X: trap3.X - rad * 2,
                Y: trap1.Y + trap1.boxHeight,
                boxHeight: rad * 2,
                boxWidth: rad * 2
            }
            return [[trap1, trap2, trap3], element];
        }
        
        
    }
    drawWall(wall){
        let color = 'yellow'
        switch(wall.type){
            case 'rockWall':
            color = '#945838';
            break;
            case 'iceWall':
            color = '#aad7df';
            break;
            case 'steelWall':
            color = '#919191';
            break;
            case 'diamondWall':
            color = '#dad9d8';
            break;
            default:
            color = 'yellow';
        }
        this.drawBox(wall, color);
    }
    chooseWallType(index){
        let type = '';
        switch(index){
            case 1:
            type = 'iceWall';
            break;
            case 2:
            type = 'steelWall';
            break;
            case 3:
            type = 'diamondWall';
            break;
            default:
            type = 'rockWall';
        }
        return type;
    }
    makeWalls(neighbor, room, radius){
        let newWall = {};
        let nC = neighbor.corners;
        if(nC.DL.Y === room.corners.UL.Y){
            newWall = {
                X: nC.DL.X,
                Y: nC.DL.Y,
                boxWidth: neighbor.boxWidth,
                boxHeight: radius * 2
            }
        } else if(nC.UL.Y === room.corners.DL.Y){
            newWall = {
                X: nC.UL.X,
                Y: nC.UL.Y - radius * 2,
                boxWidth: neighbor.boxWidth,
                boxHeight: radius * 2
            }
        } else if(nC.UL.X === room.corners.UR.X){
            newWall = {
                X: nC.UL.X - radius * 2,
                Y: nC.UL.Y,
                boxWidth: radius * 2,
                boxHeight: neighbor.boxHeight
            }
        } else if(nC.UR.X === room.corners.UL.X) {
            newWall = {
                X: nC.UR.X,
                Y: nC.UR.Y,
                boxHeight: neighbor.boxHeight,
                boxWidth: radius * 2,
            }
        }
        return newWall;
    }
    createBeginning(room, levelIndex){
        let height = room.boxHeight;
        let width = room.boxWidth;
        let shrines = []
        let shrine_height = 0.8 * height / levelIndex
        for(var i = 1; i <= levelIndex; i ++){
            let type = '';
            switch(i){
                case 1:
                type = 'fire'
                break;
                case 2:
                type = 'ice'
                break;
                case 3:
                type = 'steel'
                break;
                case 4:
                type = 'diamond'
            }
            let shrine = {
                type: type,
                X: room.X,
                Y: room.Y + 0.1 * height + shrine_height * (i - 1),
                boxWidth: this.props.gameInfo.radius * 2 - 3,
                boxHeight: shrine_height
            }
            
            shrines.push(shrine);
        }
        let fountain = {
            type: 'lifeFountain',
            X: room.X + width * 0.25,
            Y: room.Y + height * 0.25,
            boxWidth: width * 0.5,
            boxHeight: height * 0.5
        }
        shrines.push(fountain);
        room.shrines = shrines;
        return room;
    }
    choseShrineColor(shrine){
        switch(shrine.type){
            case 'fire':
            return 'red'
            case 'ice':
            return 'blue'
            case 'steel':
            return 'grey'
            case 'diamond':
            return 'white'
            case 'lifeFountain':
            return 'green'
        }
    }
    getInitialPosition(level, leftRoom){
        let rooms = level.rooms;
        let paths = level.paths;
        let neighbors = this.getNeighbors(leftRoom, paths, rooms);
        //INITIALIZE DRAWING
        neighbors.map(function(n){
            this.drawBox(n);
        }.bind(this))
        this.drawBox(leftRoom);

        let X = leftRoom.X + leftRoom.boxWidth / 2;
        let Y = leftRoom.Y + leftRoom.boxHeight / 2;
        let rad = this.props.gameInfo.radius;
        //SETS THE INNITIAL CONDITIONS FOR THE PLAYER HERE
        this.props.changePlayerInfo({
            location: leftRoom,
            position : {
                x: X, 
                y: Y
            },
            elem: this.props.elements.neutral,
            currentTexture: '#c2aa9e',
            level: 0,
            velocity: this.props.gameInfo.initialVel,
            life: 200,
            radius: this.props.gameInfo.radius,
            neighbors: neighbors
        });
    }
    buildPaths(rooms, width, height){
        let corridorsH = [];
        let corridorsV = [];
        const coredorWidth = this.props.gameInfo.coredorWidth;
        const divW = Math.floor(width / coredorWidth);
        const divH = Math.floor(height / coredorWidth);
        //These two loops create the horizontal and the vertical corridors
        for(let i = 0; i <= divH; i ++){
            let rangeH = {}
            rangeH.Y1 = i * coredorWidth;
            rangeH.Y2 = i * coredorWidth + coredorWidth;
            let findConnectionsH = this.findConnectedRooms(rangeH, rooms, 'Y');
            corridorsH = corridorsH.concat(findConnectionsH);
        }
        for(let j = 0; j <= divW; j ++){
            let rangeV = {};
            rangeV.X1 = j * coredorWidth;
            rangeV.X2 = j * coredorWidth + coredorWidth;
            let findConnectionsV = this.findConnectedRooms(rangeV, rooms, 'X');
            corridorsV = corridorsV.concat(findConnectionsV);
        }
        //Merges all the corridors that have the exact same connections into one corridor with random width
        corridorsH = this.mergeCorridors(corridorsH, 'Y');
        corridorsV = this.mergeCorridors(corridorsV, 'X');
        let allCorredors = corridorsH.concat(corridorsV);
        allCorredors = allCorredors.map(function(cor, i){
            cor = this.makeRoomAttributes(cor, i, 'corridor')
            //TEMPORARILY DRAW THE CORRIDORS 
            this.drawBox(cor);
            return cor
        }.bind(this));
        return allCorredors;
    }
    mergeCorridors(cor, orient){
        let newCor = cor;
        let updated = [];

        for(var i = 0; i < newCor.length; i ++){
            if(!newCor[i]){
                continue;
            }
            for(var j = 0; j < i; j ++){
                if(j === i || !newCor[j]){
                    continue;
                }
                if((newCor[i].connects.indexOf(newCor[j].connects[0]) !== -1) 
                && (newCor[i].connects.indexOf(newCor[j].connects[1]) !== -1)){
                    if(orient === 'Y'){
                        //randomize the height of the newly created newCorredor for more realism
                        let rand = (Math.random() * newCor[j].boxHeight);
                        newCor[i].boxHeight += rand;
                        if(newCor[i].Y < newCor[j].Y){
                            newCor[i] = this.getAllCorners(newCor[i]);
                        } else {
                            newCor[i].Y = newCor[j].Y;
                            newCor[i] = this.getAllCorners(newCor[i]);
                        }
                        newCor[j] = false;
                    } else {
                        let rand = (Math.random()*newCor[j].boxWidth);
                        newCor[i].boxWidth += rand;
                        if(newCor[i].X < newCor[j].X){
                            newCor[i] = this.getAllCorners(newCor[i]);
                        } else {
                            newCor[i].X = newCor[j].X;
                            newCor[i] = this.getAllCorners(newCor[i])
                        }
                        newCor[j] = false;
                    }
                    
                }
            }
        }
        newCor = newCor.filter(function(el){return el})
        // console.log(cor);
        return newCor;
    }
    findConnectedRooms(range, rooms, orient){
        let foundRooms = [];
        for (let i = 0; i < rooms.length; i ++){
            let rC1 = rooms[i].corners.UL[orient];
            let secCorner = orient === 'X'? 'UR' : 'DL';
            let rC2 = rooms[i].corners[secCorner][orient];
            let minDist = 0;
            let logic = false;
            if( orient === 'Y'){
                logic = ((range.Y1 + minDist > rC1) && (range.Y1 - minDist < rC2)) || ((range.Y2 + minDist> rC1) && (range.Y2 - minDist< rC2));
            } else {
                logic = ((range.X1 + minDist > rC1) && (range.X1 - minDist < rC2)) || ((range.X2 + minDist > rC1) && (range.X2 - minDist < rC2));
            }
            if(logic){
                foundRooms.push(rooms[i]);
            }
        }
        foundRooms = this.sortFoundRooms(foundRooms, orient);
        // orient === 'X'?console.log(foundRooms): null;
        let corridors = this.makeCorridors(foundRooms, range, orient);
        return corridors;
    }
    sortFoundRooms(foundRooms, orient){
        if(orient === 'Y'){
            foundRooms.sort(function(a, b){
                return a.X - b.X;
            })
        } else {
            foundRooms.sort(function(a, b){
                return a.Y - b.Y;
            })
        }
        
        return foundRooms;
    }
    makeCorridors(foundRooms, range, orient){
        let corridors = [];
        if(foundRooms.length > 1){
            for(let j = 1; j < foundRooms.length; j ++){
                let logic = false;
                if(orient === 'X'){
                    logic = ((foundRooms[j - 1].corners.DR.X > range.X2) 
                    && (foundRooms[j].corners.DR.X > range.X2) 
                    && (foundRooms[j - 1].corners.DL.X < range.X1) 
                    && (foundRooms[j].corners.DL.X < range.X1));
                } else {
                    logic = (foundRooms[j - 1].corners.UR.Y < range.Y1) 
                    && (foundRooms[j].corners.UR.Y < range.Y1) 
                    && (foundRooms[j-1].corners.DL.Y > range.Y2) 
                    && (foundRooms[j].corners.DL.Y > range.Y2);
                }
                if(logic){
                    let newCorridor = {};
                    if(orient === 'X'){
                        newCorridor.X = range.X1;
                        newCorridor.Y = foundRooms[j - 1].corners.DL.Y;
                        newCorridor.boxWidth = range.X2 - range.X1;
                        newCorridor.boxHeight = foundRooms[j].Y - foundRooms[j - 1].corners.DL.Y;
                        newCorridor = this.getAllCorners(newCorridor);
                        newCorridor.connects = [foundRooms[j].index, foundRooms[j - 1].index];
                        corridors.push(newCorridor);
                    } else {
                        newCorridor.X = foundRooms[j - 1].corners.UR.X
                        newCorridor.Y = range.Y1;
                        newCorridor.boxWidth = foundRooms[j].corners.UL.X - foundRooms[j - 1].corners.UR.X;
                        newCorridor.boxHeight = range.Y2 - range.Y1;
                        newCorridor = this.getAllCorners(newCorridor);
                        newCorridor.connects = [foundRooms[j].index, foundRooms[j - 1].index];
                        corridors.push(newCorridor);
                    }
                }
            }
        }
        return corridors;
    }
    drawBox(box, color){
        const ctx = this.getCanvas();
        if(!ctx){
            return null;
        }
        if(box.type === 'room'){
            ctx.fillStyle = this.props.gameInfo.roomColor;
        } else {
            ctx.fillStyle = this.props.gameInfo.corredorColor
        }
        if(color !== undefined){
            ctx.fillStyle = color;
        }
        ctx.fillRect(box.X, box.Y, box.boxWidth, box.boxHeight);
    }
    checkOverlap(newRoom, rooms, width, height){
        let cornersOfNewRoom = this.getAllCorners(newRoom);
        if(cornersOfNewRoom.corners.UR.X > width | cornersOfNewRoom.corners.DL.Y > height){
            return false;
        }
        let NotOverlap = false;
        for (let j = 0; j < rooms.length; j ++){
            let cornersEl = this.getAllCorners(rooms[j]);
            NotOverlap = this.findIfNotInside(cornersOfNewRoom, cornersEl);
            if(!NotOverlap){
                return false
            }
        };
        return true;
    }
    findIfNotInside(room1, room2){
        let c = room1.corners;
        let c2 = room2.corners;
        let lineChecker = this.checkForLines(c, c2);
        if(lineChecker === false){
            return false;
        }
        let lineChecker2 = this.checkForLines(c2, c);
        if(lineChecker2 === false){
            return false;
        }
        for (let corner in c){
            let checker = this.checkOneCorner(c, c2, corner);
            if(checker === false){
                return false;
            }
            let checker2 = this.checkOneCorner(c2, c, corner);
            if(checker2 === false){
                return false;
            }
        }
        return true;
    }
    checkForLines(c, c2){
        if(( (c.DL.X >= c2.DL.X ) && (c.DR.X <= c2.DR.X)) && ((c2.UL.Y >= c.UL.Y ) && (c2.DL.Y <= c.DL.Y))){
            return false;
        }
        return true;
    }
    checkOneCorner(c, c2, corner){
        //set minimum distance between boxes and then check for overlap
        let minDist = 25;
        if(((c2.UL.X - minDist <= c[corner].X ) 
        && (c[corner].X  <= (c2.UR.X + minDist))) 
        && ((c2.UL.Y - minDist <= c[corner].Y ) 
        && (c[corner].Y  <= (c2.DL.Y + minDist)))){
            return false;
        }
        return true;
    }
    getAllCorners(room){
        let corners = {};
        corners.UL = {X: room.X, Y: room.Y};
        corners.UR = {X: room.X + room.boxWidth, Y: room.Y};
        corners.DR = {X: room.X + room.boxWidth, Y: room.Y + room.boxHeight};
        corners.DL = {X: room.X, Y: room.Y + room.boxHeight};
        room.corners = corners;
        return room;
    }
    getRandomDimention(dim, object){
        if(object === 'start'){
            return Math.floor(Math.random() * dim);
        }
        let newRoomDim = Math.ceil((0.09 + Math.random() * 0.14) * dim)
        return newRoomDim;
    }
    getCanvas(){
        const canvas = document.getElementById("mycanvas");
        if(!canvas) {
            return null;
        }
        const ctx = canvas.getContext("2d");
        return ctx;
    }
    getNeighbors(location, paths, rooms){
        let connected = [];
        if(location.type === 'room'){
            connected = paths.filter(function(cor){return cor.connects.indexOf(location.index) !== -1});
        } else {
            // console.log('location: ', location)
            let neightborCor = paths.filter(function(cor){
                if(this.checkOverlappingCorredors(cor, location) === true || this.checkOverlappingCorredors(location, cor) === true){
                    return true;
                }
                return false
            }.bind(this))
            let neighborRooms = rooms.filter(function(room){
                return room.index === location.connects[0] || room.index === location.connects[1];
            });
            
            connected = neightborCor.concat(neighborRooms);
        }
        return connected;
    }
    checkOverlappingCorredors(cor1, cor2){
        let c = cor1.corners;
        let c2 = cor2.corners;
        if(( (c.DL.X > c2.DL.X ) && (c.DR.X < c2.DR.X)) && ((c2.UL.Y > c.UL.Y ) && (c2.DL.Y < c.DL.Y))){
            return true;
        }
        return false;
    }
    handleKeyDown(ev) {
        const ctx = this.getCanvas();
        const key = ev.key;
        let level = this.props.levels[0];
        let neighbors = this.props.player.neighbors;
        // draw the current location and all the neighboors
        let currentPlace = this.props.player.location;
        let player = JSON.parse(JSON.stringify(this.props.player));
        this.drawBox(currentPlace);
        let action = {
            player: player,
            key: 'start', 
            currentPlace: currentPlace, 
            level: level,
            pressed: false,
            initialVel: this.props.gameInfo.initialVel
        }
        let action2 = {
            player: this.props.player,
            currentPlace: this.props.player.location, 
            level: this.props.levels[0],
            key: ev.key,
            pressed: true,
            initialVel: this.props.gameInfo.initialVel
        }  
             
        if(this.props.player.velocity > 0){
            // let inter = setInterval(() => {
            var requestAnimationFrame = window.requestAnimationFrame;
            var cancelAnimationFrame = window.cancelAnimationFrame;
            var animateBall = () =>  {
                 
                ctx.clearRect(0, 0, this.props.gameInfo.canvasWidth, this.props.gameInfo.canvasHeight);
                let currentPlace = this.props.player.location;
                this.props.player.neighbors.map((n) => {
                    if(n.type === 'room'){
                        ctx.clearRect(n.X, n.Y, n.boxWidth, n.boxHeight)
                        this.drawBox(n);
                        if(n.shrines.length > 0){
                            n.shrines.map((s) => {this.drawBox(s, this.choseShrineColor(s))});
                        }
                    } else {
                        if(currentPlace.type !== 'corridor'){
                            ctx.clearRect(n.X, n.Y, n.boxWidth, n.boxHeight)
                            this.drawBox(n);
                        }
                    }
                });

                this.drawBox(currentPlace);
                currentPlace.shrines.map(function(s){
                    {this.drawBox(s, this.choseShrineColor(s))}
                }.bind(this))
                // console.log('velocity hereeeee', this.props.player.velocity);
                if(this.props.player.velocity === 0){
                    // clearInterval(inter);
                    cancelAnimationFrame(myFrame);
                    this.props.changePlayerInfo(action);
                    return;
                } else {
                    this.props.changePlayerInfo(action2); 
                }
            // }, 20);
                var myFrame = requestAnimationFrame(animateBall);
            };
            animateBall();
        } else {
            this.props.changePlayerInfo(action);
        }

        // frame = requestAnimationFrame(animateBall);
    }
    componentDidMount(){
        this.buildRooms(4);
        document.addEventListener("keydown", this.handleKeyDown, false);
    }
    render() {
        this.renderPosition();
        return (
            <canvas id='mycanvas' height={this.props.gameInfo.canvasHeight} width={this.props.gameInfo.canvasWidth}>
            </canvas>
        )
    }
}

function mapStateToProps(state){
    return {
        gameInfo: state.gameInfo,
        player: state.player,
        levels: state.levels,
        elements: state.elements
    };
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators({changePlayerInfo: changePlayerInfo, makeNewLevel: makeNewLevel}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);