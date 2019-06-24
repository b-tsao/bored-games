import React from 'react';
import {Link} from 'react-router-dom';

export default class HelloWorld extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello World!</h1>

        <p>This is a ghetto landing page for Avalon! A quick project written and hosted on <a href="http://glitch.com">Glitch</a> to help friends play together without the need for physical board pieces or setup.</p>

        <p>Enter your name here:</p>

        <form>
          <input name="username" type="text" maxLength="100" placeholder="Noob" aria-labelledby="submit" />
          <Link to="/waiting" >
            <button type="submit" id="submit">Submit</button>
          </Link>
        </form>
      </div>
    );
  }
}