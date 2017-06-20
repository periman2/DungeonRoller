import React, { Component } from 'react';
import Game from '../containers/game';
import Settings from '../containers/settings'
import Title from './title';


export default class App extends Component {
  render() {
    return (
      <div>
        <Title />
        <Settings />
        <Game />
      </div>
    );
  }
}
