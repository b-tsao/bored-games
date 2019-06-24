import React from 'react';
import {Link} from 'react-router-dom';

const names = ["Brian", "Ryan", "Curtis", "Wei", "Raymond", "Tony", "Casey"];

export default class WaitingRoom extends React.Component {
  render() {
    return (
      <div>
        <h1>Waiting Room</h1>

        <p>This is the ghetto waiting room for Avalon while you wait for your friends to join!</p>

        <ul>
          {names.map(function(name, i) {
            return <li key={i}>{name}</li>;
          })}
        </ul>

        <button type="join" id="join">Join</button>
        <Link to='/'>
          <button type="exit" id="exit" style={{marginLeft: '10px'}}>Exit</button>
        </Link>
      </div>
    );
  }
}