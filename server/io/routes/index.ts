import express from 'express';
import { hello } from './requests/HelloWorldRequest';
import { getGames } from './requests/GameManagerRequest';
import { createRoom } from './requests/RoomManagerRequest';

export const router = express.Router();

router.get('/heartbeat', hello);
router.get('/games/all', getGames);
router.post('/room/create', createRoom);