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
    }
    
    handleKeyDown(ev) {
        const key = ev.key;
        const position = this.props.playerPosition;
        //This will update according to velocit and acceleration in the future too
        const updatePosition = this.updatePosition(position, 3, key);
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
        let Start = {};
        
        let density = 20;
        for(let i = 0; i < density; i ++){
            Start.X = this.getRandomDimention(width, 'start');
            Start.Y = this.getRandomDimention(height, 'start');
            let newRoom = {}
            newRoom.boxWidth = this.getRandomDimention(width);
            newRoom.boxHeight = this.getRandomDimention(height);
            newRoom.X = this.getRandomDimention(width, 'start');
            newRoom.Y = this.getRandomDimention(height, 'start');
            if(rooms.length > 0){
                let isOverlap = rooms.filter(this.checkOverlap(room, newRoom));
            } else {
                //if there is no room craeted then create one
                rooms.push(newRoom);
            }
        }
        console.log(rooms);
        
        // console.log(newRoom);
    }
    checkOverlap(oldRoom, newRoom){
        console.log(oldRoom, newRoom);
    }   
    getRandomDimention(dim, object){
        if(object === 'start'){
            return Math.floor(Math.random() * dim);
        }
        const randomize = 0.2 + Math.random() * 0.15;
        let newRoomDim = Math.ceil((0.05 + Math.random() * 0.15) * dim)
        return newRoomDim;
    }
    getVariance(dim){
        return 0.2 * dim + dim;
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