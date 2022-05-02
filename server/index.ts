// init project
import express from 'express';
// const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
import path from 'path';
import bodyParser from 'body-parser';
import { router } from './io/routes';

import http from 'http';
import IOServer from './io/IOServer';

// resources
import log4js from 'log4js';
log4js.configure('log4js.config.json');

// boardgame.io server
import { Server } from 'boardgame.io/server';
import { Mahjong } from '../src/games/mahjong/game';
import { ChineseWerewolf } from '../src/games/chinese-werewolf/game';

import env from 'dotenv';
env.config();

/**
 * Starts the Express server.
 *
 * @return {http.Server} instance of the Express server.
 */
function startServer(): http.Server {
    const app = express();
    const logger = log4js.getLogger('server');

    // Redirect HTTP to HTTPS,
    // app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/], 301));

    // Enable router to parse json and url-encoded payloads
    app.use(bodyParser.json({ limit: '2mb' })); // Limit can be lower (10kb?) since there should not be a lot of data per request (helps protect against json expansion attacks I guess)
    app.use(bodyParser.urlencoded({ limit: '2mb', extended: false })); // (200kb?)

    // Logging for each received request
    app.use((req, res, next) => {
        const path = `'${req.method} ${req.path}'`;
        const body = req.body.constructor === Object && Object.entries(req.body).length === 0 ? false : JSON.stringify(req.body);
        const payload = body ? ` ${body.length} ${body}` : '';
        const log = `${req.ip} - ${path}${payload}`;
        log4js.getLogger('receive').info(log);
        next();
    });

    // Logging for each returned request
    app.use(log4js.connectLogger(log4js.getLogger('return'), { level: 'info' }));

    // Handle requests for static files
    app.use(express.static('build/public'));

    // Router setup
    app.use(router);

    // Handle every other route with index.html, which will contain a script tag to your application's JavaScript file(s).
    // This is the catch-all approach for rendering; redirecting to index.html for client-side rendering on routes
    app.get('*', (req, res) => {
        res.sendFile(path.resolve('build', 'public', 'index.html'));
    });

    const server = http.createServer(app);

    const sio = new IOServer(server);

    // Start the server
    server.listen(process.env.REACT_APP_PORT || 8080, () => {
        const address = server.address();
        if (address) {
            logger.info('Your app is listening on port ' + (typeof address === 'string' ? address : address.port));
        } else {
            logger.error('Failed to retrieve listening port');
        }
    });

    return server;
}

function startBGServer() {
    const logger = log4js.getLogger('BGIO');
    const server = Server({
        games: [Mahjong, ChineseWerewolf]
    });
    server.run(parseInt(process.env.REACT_APP_BGIO_PORT || '8000', 10), () => {
        logger.info(`Server is listening on ${process.env.REACT_APP_BGIO_PORT || 8000}`);
    });
}

startServer();
startBGServer();