import * as express from 'express';
import log4js from 'log4js';

const logger = log4js.getLogger('HelloWorld');

export function hello(req: express.Request, res: express.Response) {
  logger.debug('Hello World request received');
  res.send('Hello, World!');
}