import React, {Component} from 'react';
import {connect} from 'react-redux';

class Settings extends Component {
    render() {
        let elem = null;
        let enemy = null;
        let life = 0;
        let XP = 1;
        let location = null;
        if(this.props.player.life > 0){
            life = Math.floor(this.props.player.life)
        }
        if( this.props.player.XP > 1 ){
            XP = Math.round(this.props.player.XP);
        }
        if(this.props.player.elem){
            elem = this.props.player.elem.name
        }
        if(this.props.player.inCollision && this.props.player.inCollision.type.strength > 0){
            enemy = <div><p>Wall: {Math.floor(this.props.player.inCollision.type.strength)}</p></div>;
        }
        if(this.props.player.location){
            location = <div><p>Location: {this.props.player.location.type} {this.props.player.location.index}</p></div>
        }
        return (
            <div>
                <div className='settings'>
                    <div><p>Element: {elem}</p></div>
                    <div><p>Life: {life}</p></div>
                    <div><p>XP: {XP}</p></div>
                    {enemy}
                    {location}
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