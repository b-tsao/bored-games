'use strict';

const log4js = require('log4js');
const deepExtend = require('deep-extend');
const {changeListener, setListener} = require('./lib/Plugin');

class Game {
  constructor(game) {
    this.id = game.id;
    this.name = game.name;
    this.setup = game.setup;
    this.moves = game.moves;
    this.playerView = game.playerView;
    this.spectatorView = game.spectatorView;
    this.flow = game.flow;
    this.settings = game.settings;

    this.state = {};
    this.context = {};
  }
  
  get ctx() {
    return {
      id: this.id,
      name: this.name,
      settings: this.settings,
      ...this.context
    };
  }
  
  serialize(ctx, playerId) {
    return setListener(this.state, draft => {
      if (this.context.phase) {
        if (playerId !== undefined && this.playerView !== undefined) {
          return this.playerView(ctx, draft, playerId);
        } else if (this.spectatorView !== undefined) {
          return this.spectatorView(ctx, draft);
        }
      }
    });
  }
  
  start(ctx, callback = () => {}) {
    const context = {
      phase: this.flow && this.flow.startingPhase || 'default'
    };
    
    // grab the changes and pseudo next context to pass into setup
    const [err, nextCtx, ctxChanges] = changeListener(ctx, draft => {
      deepExtend(draft, context);
    });
    
    const [nextState, stateChanges] = setListener(this.state, state => {
      return this.setup(nextCtx);
    });
    
    if (typeof nextState === 'string') {
      return callback(nextState); // error
    } else {
      this.context = context;
      const prevState = this.state;
      this.state = nextState;
      return callback(null, ctxChanges, stateChanges, prevState);
    }
  }
  
  emit(move, data) {
    if (this.moves.hasOwnProperty(move)) {
      const err = this.moves[move](this.state, this.ctx, data);
      if (err) {
        return err;
      }
    }
  }
  
  changeSettings(settings, callback = () => {}) {
    const ctx = {
      settings: this.settings
    };
    const [err, nextCtx, changes] = changeListener(ctx, (draft) => {
      deepExtend(draft.settings, settings);
      return this.settings.onChange(draft.settings);
    });
    if (err === undefined) {
      this.settings = nextCtx.settings;
      return callback(null, changes);
    } else {
      return callback(err);
    }
  }
  
  attachEvents(ctx, state) {
    ctx.events = {
      endPhase: (flow) => {
        const currentPhase = this.flow && this.flow.phases && this.flow.phases[this.context.phase];
        if (currentPhase) {
          if (currentPhase.hasOwnProperty('onPhaseEnd')) {
            currentPhase.onPhaseEnd(ctx, state);
          }
          if (flow !== undefined && flow.next !== undefined) {
            this.context.phase = flow.next;
          } else {
            this.context.phase = currentPhase.next;
          }
        }
        const nextPhase = this.flow && this.flow.phases && this.flow.phases[this.context.phase];
        if (nextPhase) {
          if (nextPhase.hasOwnProperty('onPhaseBegin')) {
            nextPhase.onPhaseBegin(ctx, state);
          }
        }
      },
      endTurn: (nextPlayer) => {
        
      },
      endGame: () => {
        
      }
    };
  }
}

module.exports = Game;
