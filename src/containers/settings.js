import React, {Component} from 'react';
import {connect} from 'react-redux';

class Settings extends Component {
    render() {
        return (
            <div>
                <h2>{this.props.player.velocity}</h2>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        gameInfo: state.gameInfo,
        player: state.player,
        levels: state.levels
    };
}
export default connect(mapStateToProps)(Settings);