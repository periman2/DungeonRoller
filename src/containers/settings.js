import React, {Component} from 'react';
import {connect} from 'react-redux';

class Settings extends Component {
    render() {
        let elem = null;
        let enemy = null;
        let life = 0;
        let XP = 1;
        if(this.props.player.life > 0){
            life = Math.floor(this.props.player.life)
        }
        if( this.props.player.XP > 1 ){
            XP = Math.floor(this.props.player.XP);
        }
        if(this.props.player.elem){
            elem = this.props.player.elem.name
        }
        if(this.props.player.inCollision && this.props.player.inCollision.type.strength >= 0){
            enemy = Math.floor(this.props.player.inCollision.type.strength);
        }
        return (
            <div>
                <div>
                    <h2>Element: {elem}</h2>
                    <h2>Life: {life}</h2>
                    <h2>XP: {XP}</h2>
                    <h2>enemy: {enemy}</h2>
                </div>
            </div>
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
}
export default connect(mapStateToProps)(Settings);