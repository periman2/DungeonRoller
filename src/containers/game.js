import React , { Component } from 'react';
import { connect } from 'react-redux';
import { changePlayerPosition } from '../actions/player_move_action';
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
    }
    renderPosition() {
        let ctx = this.getCanvas();
        if(!ctx) {
            return null;
        }
        ctx.clearRect(0, 0, width, height);

        const width = this.props.gameInfo.canvasWidth;
        const height = this.props.gameInfo.canvasHeight;
        const dim = {
            x: this.props.playerPosition.x,
            y: this.props.playerPosition.y,
            r: 5
        }
        ctx.beginPath();
        ctx.arc(dim.x, dim.y, dim.r, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
        ctx.scale(2, 2)
        ctx.translate(dim.x, dim.y)
        
    }
    
    handleKeyDown(ev) {
        const ctx = this.getCanvas();
        const key = ev.key;
        const position = this.props.playerPosition;
        //This will update according to velocit and acceleration in the future too
        ctx.clearRect((position.x - 5), (position.y - 5), 10, 10);
        const updatePosition = this.updatePosition(position, 4, key);
        this.props.changePlayerPosition(updatePosition);
    }
    buildRooms(){
        let ctx = this.getCanvas();
        if(!ctx) {
            return null;
        }
        let rooms = [];
        const width = this.props.gameInfo.canvasWidth;
        const height = this.props.gameInfo.canvasHeight;
        ctx.clearRect(0, 0, width, height);
        // innitiate with a random starting point;
        
        let density = 150;
        for(let i = 0; i < density; i ++){
            let newRoom = {}
            newRoom.boxWidth = this.getRandomDimention(width);
            newRoom.boxHeight = this.getRandomDimention(height);
            newRoom.X = this.getRandomDimention(width, 'start');
            newRoom.Y = this.getRandomDimention(height, 'start');
            if(rooms.length > 0){
                let isOverlap = this.checkOverlap(newRoom, rooms, width, height);
                if(isOverlap){
                    rooms.push(newRoom);
                    this.drawBox(ctx, newRoom);
                }
            } else {
                //if there is no room craeted then create one
                rooms.push(newRoom);
                this.drawBox(ctx, newRoom);
            }
        }
        // console.log(rooms);        
    }
    drawBox(ctx, room){
        ctx.rect(room.X, room.Y, room.boxWidth, room.boxHeight);
        ctx.stroke();
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
            // console.log(NotOverlap);
            //NotOverlap is true when there is no overlap
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
        if(((c2.UL.X <= c[corner].X ) && (c[corner].X  <= (c2.UR.X))) && ((c2.UL.Y <= c[corner].Y ) && (c[corner].Y  <= (c2.DL.Y)))){
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
        const randomize = 0.2 + Math.random() * 0.15;
        let newRoomDim = Math.ceil((0.05 + Math.random() * 0.15) * dim)
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
    updatePosition(position, amount, key){
        switch(key){
            case 'ArrowUp':
            position.y -= amount;
            break
            case 'ArrowDown':
            position.y += amount;
            break
            case 'ArrowLeft':
            position.x -= amount;
            break
            case 'ArrowRight':
            position.x += amount;
        }
        return position;
    }
    componentDidMount(){
        this.buildRooms();
        this.renderPosition();
        const playerInitialPosition = {
            x: this.props.gameInfo.canvasWidth / 2,
            y: this.props.gameInfo.canvasHeight / 2
        };
        this.props.changePlayerPosition(playerInitialPosition);
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
        playerPosition: state.playerPosition
    };
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators({changePlayerPosition: changePlayerPosition}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);