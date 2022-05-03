import * as express from 'express';
import log4js from 'log4js';

import { games } from '../../../games';

const logger = log4js.getLogger('GameManagerRequest');

export function getGames(req: express.Request, res: express.Response) {
  logger.info('Games request received');
  res.send(games);
}