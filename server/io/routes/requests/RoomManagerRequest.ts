import * as express from 'express';
import log4js from 'log4js';
import RoomManager from '../../../core/RoomManager';

const logger = log4js.getLogger('RoomManagerRequest');

export function createRoom(req: express.Request, res: express.Response) {
  const { gameID } = req.body;
  logger.trace(`Create game (${gameID}) room requested`);

  RoomManager.createRoom(gameID, (err, room) => {
    if (err) {
      logger.error(`Create game (${gameID}) room request denied: ${err}`);
      res.status(400).send(err.message);
    } else {
      const key = room.key;
      logger.info(`Game (${gameID}) room created; key (${key})`);
      res.status(201).json({ key });
    }
  });
}