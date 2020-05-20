import React from 'react';
import './BeggarsTable.css';

export class BeggarsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      interruptTimer: null,
      selectedTiles: []
    };
  }

  endStage = () => {
    this.props.events.endStage();
    console.log('too late', this.props.playerID);
  }
  rollDice = () => {
    this.props.moves.rollDice();
  }

  drawTile = () => {
    this.props.moves.drawTile();
    this.clearSelect();
  }

  replaceTile = () => {
    this.props.moves.replaceTile();
    this.clearSelect();
  }

  discardTiles = () => {
    this.props.moves.discardTile(this.state.selectedTiles[this.state.selectedTiles.length - 1]);
    this.clearSelect();
    // setTimeout(() => this.endStage(), 2000);
  }

  declareKong = () => {
    if (this.state.selectedTiles.length === 1) {
      this.props.moves.declareKong(this.state.selectedTiles[0]);
    } else {
      this.props.moves.declareKong(this.state.selectedTiles);
    }
    this.clearSelect();
  }

  claimTile = () => {
    this.props.moves.claimTile(this.state.selectedTiles);
    this.clearSelect();
  }

  skipTile = () => {
    this.props.moves.skipTile();
    this.clearSelect();
  }

  claimVictory = () => {
    this.props.moves.claimVictory();
    this.clearSelect();
  }

  selectTile = (sel) => {
    const selections = this.state.selectedTiles;
    selections.push(sel);
    this.setState({
      selectedTiles: selections
    });
  }

  clearSelect = () => {
    this.setState({
      selectedTiles: []
    });
  }

  render() {
    // console.log(this.props.ctx);
    // console.log(this.props.G);
    // console.log(this.props.ctx.phase);

    // if (this.props.ctx.phase === 'interrupt' && !this.state.interruptTimer) {
    //   this.setState({
    //     interruptTimer: setTimeout(this.endStage, 2000),
    //   });
    // }

    let concealedHand = [];
    let revealedHand = [];
    let discardPile = [];

    this.props.playerID && Array.isArray(this.props.G.players[this.props.playerID].hand) && this.props.G.players[this.props.playerID].hand.forEach((tile, pos) => {
      concealedHand.push(
        <div key={"hand-" + this.props.playerID + "-" + pos} className="tile" onClick={() => this.selectTile(pos)}>
          <div>{tile.suit}</div>
          <div>{tile.value}</div>
        </div>
      );
    });

    this.props.playerID && this.props.G.players[this.props.playerID].revealed.forEach((reveals, idx) => {
      reveals.forEach((tile, idxx) => {
        revealedHand.push(
          <div key={"reveals-" + this.props.playerID + "-" + idx + "-" + idxx} className="tile">
            <div>{tile.suit}</div>
            <div>{tile.value}</div>
          </div>
        );
      });
    });

    this.props.G.discard.forEach((tile, idx) => {
      discardPile.push(<li key={"discard-" + idx}>{tile.suit}, {tile.value}</li>);
    });

    let actions = null;
    if (this.props.ctx.phase === 'setup') {
      actions = (this.props.ctx.currentPlayer === this.props.playerID) ? <button onClick={this.rollDice}>Roll Dice</button> : <h3>Waiting for roll</h3>;
    } else {
      actions = (this.props.ctx.activePlayers != null && this.props.isActive) ?
        (this.props.ctx.activePlayers[this.props.playerID] === 'draw') ?
          (<div>
            <button onClick={this.drawTile}>Draw</button>
            <button onClick={this.claimTile}>Claim</button>
            <button onClick={this.clearSelect}>Clear</button>
          </div>) :
          (this.props.ctx.activePlayers[this.props.playerID] === 'replace') ?
            (<div>
              <button onClick={this.replaceTile}>Replace</button>
              <button onClick={this.clearSelect}>Clear</button>
            </div>)
            :
            (this.props.ctx.activePlayers[this.props.playerID] === 'discard') ?
              (<div>
                <button onClick={this.discardTiles}>Discard</button>
                <button onClick={this.declareKong}>Kong</button>
                <button onClick={this.claimVictory}>Mahjong</button>
                <button onClick={this.clearSelect}>Clear</button>
              </div>) :
              (this.props.ctx.activePlayers[this.props.playerID] === 'claim') ?
                (<div>
                  <button onClick={this.claimTile}>Claim</button>
                  <button onClick={this.skipTile}>Skip</button>
                  <button onClick={this.clearSelect}>Clear</button>
                </div>) :
                null
        : null;
    }

    return (
      <div className="mahjong-table">
        <h1 className={this.props.ctx.currentPlayer === this.props.playerID ? "current-player" : ""}>You are Player {this.props.playerID}</h1>
        {this.props.ctx.activePlayers != null && this.props.isActive ? <h3 className="stage">Stage: {this.props.ctx.activePlayers[this.props.playerID]}</h3> : null}
        {this.state.selectedTiles.length > 0 ? JSON.stringify(this.state.selectedTiles.map(pos => (this.props.G.players[this.props.playerID].hand[pos]))) : null}
        {actions}
        <br />
        {revealedHand}
        <br />
        {concealedHand}
        <h3>Discard Pile</h3>
        {this.props.G.discard.length > 0 &&
          discardPile}
      </div>
    )
  }
}