import React, {Component} from 'react';
import {connect} from 'react-redux';

class Settings extends Component {
    render() {
        let elem = null;
        let enemy = null;
        if(this.props.player.elem){
            elem = this.props.player.elem.name
        }
        if(this.props.player.inCollision){
            enemy = this.props.player.inCollision.type.strength;
        }
        return (
            <div>
                <div>
                    <h2>Element: {elem}</h2>
                    <h2>Life: {this.props.player.life}</h2>
                    <h2>XP: {this.props.player.XP}</h2>
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