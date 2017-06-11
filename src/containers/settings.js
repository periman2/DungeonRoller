import React, {Component} from 'react';
import {connect} from 'react-redux';

class Settings extends Component {
    render() {
        let elem = null;
        if(this.props.player.elem){
            elem = this.props.player.elem.name
        }
        return (
            <div>
                <div>
                    <h2>Element: {elem}</h2>
                    <h2>Life: {this.props.player.life}</h2>
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