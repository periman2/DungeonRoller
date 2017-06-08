import React, { Component } from 'react';
import Game from '../containers/game';
import Settings from '../containers/settings'

export default class App extends Component {
  render() {
    return (
      <div>
        <Game />
        <Settings />
      </div>
    );
  }
}
