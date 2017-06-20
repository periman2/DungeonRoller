import React, {Component} from 'react';
import changeInst from '../actions/action_handle_inst';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class Instructions extends Component {
    constructor(props){
        super(props);
        this.state = {show: false, on: true}
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleCancelButtonClick = this.handleCancelButtonClick.bind(this);
    }
    handleButtonClick(){
        if(this.state.show){
            this.setState({show: false});
        } else {
            this.setState({show: true});
        }
    }
    handleCancelButtonClick(){
        this.setState({on: false})
    }
    render(){
        let inst = null;
        if(this.state.show){
            inst = (
            <div className='details' >
                {/*<h2>Instructions for the game</h2>*/}
                <h2>What's the goal?</h2>
                <p>You are an element hunter. You've been bunished by the element gods for mistreating the essense and power of the elements and using it to your own liking. But! There is still hope for you. If you manage to collect all the elements one by one and retrieve them to their respective shrines you will be able to make it back to the realm and continue your service to the Gods. Likely you have developed the ability to absorbe the essense of the elements and therefor you can now become them!</p>
                <ul>
                    <li><p>All the elements are guarded by walls. You need to brake those walls in order to get to these elements. Be carefull not to die and make sure to replenish your life in the place you where first born, in the fountain of life.</p></li>
                    <li><p>To get an element you have to go through a trap. If your center of mass falls inside the trap you will die and restart from the level you where before.</p></li>
                    <li><p>There are 4 levels, one for each element. First level is fire, second is ice then steel and finally diamond. In each level you will have to find again and retrieve all the previous elements too in order to pass it.</p></li>
                    <li><p>The diamond element REQUIRES you to be the element of steel in order to break through its walls.</p></li>
                    <li><p>Keep in mind some walls at random cannot break. They're unbreakable.</p></li>
                </ul>
                <p style={{textAlign: 'center'}}>Good Luck!</p>
            </div>
                )
        }
        return (
            <div className='inst'>
                <div className='upper'>
                    <h1>Welcome to the Dungeon Roller game !</h1>
                    <button onClick={this.handleButtonClick}>{(this.state.show && 'Hide Instructions' )|| 'Show Instructions'}</button>
                    <button onClick={()=>{this.props.changeInst({on: false})}}>Close and Play</button>
                </div>
                {inst}
            </div>
        )
    }
    
}

function mapDispatchToProps(dispatch){
    return bindActionCreators(
        {
            changeInst: changeInst
        },dispatch);
};

export default connect(null, mapDispatchToProps)(Instructions);