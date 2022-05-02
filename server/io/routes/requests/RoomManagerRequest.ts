import * as express from 'express';
import log4js from 'log4js';
import RoomManager from '../../../core/RoomManager';

const logger = log4js.getLogger('RoomManagerRequest');

export function createRoom(req: express.Request, res: express.Response) {
  const { id, title } = req.body;
  logger.trace(`Create game (${id}) room requested`);

  RoomManager.createRoom({ id, title }, (err, room) => {
    if (err) {
      logger.error(`Create game (${id}) room request denied: ${err}`);
      res.status(400).send(err.message);
    } else {
      const key = room.key;
      logger.info(`Game (${id}) room created; key (${key})`);
      res.status(201).json({ key });
    }
  });
}