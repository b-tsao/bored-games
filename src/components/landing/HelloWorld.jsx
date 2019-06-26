import React from 'react';
import Games from './Games';

export default function HelloWorld() {
  return (
    <div>
      <h1>Hello, World!</h1>

      <p>This is the ghetto landing page for <del>bored</del> <ins>board</ins> games! A quick project written and hosted on <a href="http://glitch.com">Glitch</a> to help friends play board games together without the need for physical board pieces or setup.</p>

      <p>Select a game:</p>
      <Games />
    </div>
  );
}