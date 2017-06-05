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
        this.drawCoridor = this.drawCoridor.bind(this);
        this.makeCorridors = this.makeCorridors.bind(this);
        this.mergeCorridors = this.mergeCorridors.bind(this);
        this.getInitialPosition = this.getInitialPosition.bind(this);
        this.getNeighbors = this.getNeighbors.bind(this);
    }
    renderPosition() {
        let ctx = this.getCanvas();
        if(!ctx) {
            return null;
        }
        // ctx.clearRect(0, 0, width, height);

        const width = this.props.gameInfo.canvasWidth;
        const height = this.props.gameInfo.canvasHeight;
        // console.log(this.props.player);
        let CorWidth = this.props.gameInfo.coredorWidth;
        let dim = {
            x: this.props.player.position.x,
            y: this.props.player.position.y,
            r: this.props.gameInfo.radius
        }
        ctx.beginPath();
        ctx.arc(dim.x, dim.y, dim.r, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    }
    buildRooms(){
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
                    newRoom.index = roomIndex;
                    newRoom.type = 'room';
                    rooms.push(newRoom);
                    this.drawBox(ctx, newRoom);
                    roomIndex ++;
                }
            } else {
                //if there is no room craeted then create one
                newRoom.index = roomIndex;
                rooms.push(newRoom);
                this.drawBox(ctx, newRoom);
                roomIndex ++;
            }
        }
        // Build the coridors that connect the boxes
        let paths = this.buildPaths(rooms, width, height);
        let randomRoomIndex = Math.floor(rooms.length * Math.random());
        let randRoom = rooms[randomRoomIndex];
        let level = {rooms: rooms, paths: paths};
        this.props.makeNewLevel(level);

        // INITIATE WITH A RANDOM STARTING POINT
        this.getInitialPosition(level);
        return rooms;
    }
    getInitialPosition(level){
        let rooms = level.rooms;
        let paths = level.paths;
        let randomRoomIndex = Math.ceil((rooms.length - 1) * Math.random());
        let randRoom = rooms[randomRoomIndex];
        console.log('random room', randRoom)
        let connected = this.getNeighbors(randRoom, paths, rooms);
        // Tests Here
        // console.log('these are the neighboors of ', connected[0], this.getNeighbors(connected[0], paths, rooms))
        // console.log('corridors that connect to a room',connected);
        let X = randRoom.X + randRoom.boxWidth / 2;
        let Y = randRoom.Y + randRoom.boxHeight / 2;
        let rad = this.props.gameInfo.radius;
        let corners  = {
            UL: {X: X - rad, Y: Y - rad},
            UR: {X: X + rad, Y: Y - rad},
            DR: {X: X + rad, Y: Y + rad},
            DL: {X: X - rad, Y: Y + rad}
        }
        this.props.changePlayerInfo({
            location: {place: randomRoomIndex, type: 'room'},
            position : {
                x: X, 
                y: Y
            },
            corners: corners,
            currentTexture: this.props.gameInfo.roomColor,
            level: 0,
            angle: 0,
            velocity: 0,
            acceleration: 0,
            radius: this.props.gameInfo.radius,
            neighbors: connected
        });
    }
    //troubleshoot this later
    getNeighbors(location, paths, rooms){
        let connected = [];
        if(location.type === 'room'){
            connected = paths.filter(function(cor){return cor.connects.indexOf(location.index) !== -1});
        } else {
            let neightborCor = paths.filter(function(cor){
                if(this.checkOverlappingCorredors(cor, location) === true || this.checkOverlappingCorredors(location, cor) === true){
                    return cor;
                }
            }.bind(this))
            let neighborRooms = rooms.filter(function(room){
                return room.index === location.connects[0] || room.index === location.connects[1];
            })
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
    buildPaths(rooms, width, height){
        let corridorsH = [];
        let corridorsV = [];
        const coredorWidth = this.props.gameInfo.coredorWidth;
        const divW = Math.floor(width / coredorWidth);
        const divH = Math.floor(height / coredorWidth);
        for(let i = 0; i <= divH; i ++){
            let rangeH = {}
            rangeH.Y1 = i * coredorWidth;
            rangeH.Y2 = i * coredorWidth + coredorWidth;
            let findConnectionsH = this.findConnectedRooms(rangeH, rooms, 'Y');
            corridorsH = corridorsH.concat(findConnectionsH);
        }
        // console.log(corridorsH);
        for(let j = 0; j <= divW; j ++){
            let rangeV = {};
            rangeV.X1 = j * coredorWidth;
            rangeV.X2 = j * coredorWidth + coredorWidth;
            let findConnectionsV = this.findConnectedRooms(rangeV, rooms, 'X');
            corridorsV = corridorsV.concat(findConnectionsV);
        }
        // console.log(corridorsV);
        corridorsH = this.mergeCorridors(corridorsH, 'Y');
        corridorsV = this.mergeCorridors(corridorsV, 'X');
        let allCorredors = corridorsH.concat(corridorsV);
        // set indeces and types for corridors
        allCorredors = allCorredors.map(function(cor, i){
            cor.index = i;
            cor.type = 'corridor';
            return cor
        });
        // console.log('these are all the corredors', allCorredors);
        // temporary drawing;
        corridorsV.map(function(cor){
            this.drawCoridor(cor);
        }.bind(this))
        corridorsH.map(function(cor){
            this.drawCoridor(cor);
        }.bind(this))
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
                if((newCor[i].connects.indexOf(newCor[j].connects[0]) !== -1) && (newCor[i].connects.indexOf(newCor[j].connects[1]) !== -1)){
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
                //Check later for mistakes!
                let logic = false;
                if(orient === 'X'){
                    logic = ((foundRooms[j - 1].corners.DR.X > range.X2) && (foundRooms[j].corners.DR.X > range.X2) && (foundRooms[j - 1].corners.DL.X < range.X1) && (foundRooms[j].corners.DL.X < range.X1));
                    // logic = true;
                } else {
                    logic = (foundRooms[j - 1].corners.UR.Y < range.Y1) && (foundRooms[j].corners.UR.Y < range.Y1) && (foundRooms[j-1].corners.DL.Y > range.Y2) && (foundRooms[j].corners.DL.Y > range.Y2);
                }
                // console.log(logic);
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
    drawCoridor(room){
        const ctx = this.getCanvas();
        if(!ctx){
            return null;
        }
        ctx.fillStyle = this.props.gameInfo.corredorColor
        ctx.fillRect(room.X, room.Y, room.boxWidth, room.boxHeight);
    }
    drawBox(ctx, room){
        ctx.fillStyle = this.props.gameInfo.roomColor;
        ctx.fillRect(room.X, room.Y, room.boxWidth, room.boxHeight);
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
        let minDist = 10;
        if(((c2.UL.X - minDist <= c[corner].X ) && (c[corner].X  <= (c2.UR.X + minDist))) && ((c2.UL.Y - minDist <= c[corner].Y ) && (c[corner].Y  <= (c2.DL.Y + minDist)))){
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
        let newRoomDim = Math.ceil((0.085 + Math.random() * 0.14) * dim)
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
    handleKeyDown(ev) {
        const ctx = this.getCanvas();
        const key = ev.key;
        var position = this.props.player.position;
        //This will update according to velocit and acceleration in the future too
        let currentPlace = {};
        if(this.props.player.location.type === 'room'){
            currentPlace = this.props.levels[0].rooms.filter(function(room){return room.index === this.props.player.location.place}.bind(this))
            // console.log(currentPlace);
            this.drawBox(ctx, currentPlace[0]);
        } else {
            // FOR THE CORRIDORS I ALSO NEED TO CHECK IF THERE ARE OVERLAPING ONES
            currentPlace = this.props.levels[0].paths.filter(function(cor){return cor.index === this.props.player.location.place}.bind(this));
            this.drawCoridor(currentPlace[0]);
        }
        let player = this.props.player;
        console.log(currentPlace);
        this.props.changePlayerInfo({player: player, amount: 4, key: key, currentPlace: currentPlace[0]});
    }
    filterUpdatedPosition(newPos){
        // let position = this.props.player.position;
        // console.log(position, newPos);
    }
    updatePosition(position, amount, key){
        let newPos = position;
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
        return newPos;
    }    
    componentDidMount(){
        this.buildRooms();
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
        levels: state.levels
    };
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators({changePlayerInfo: changePlayerInfo, makeNewLevel: makeNewLevel}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);