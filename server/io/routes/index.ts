import express from 'express';
import { hello } from './requests/HelloWorldRequest';
import { createRoom } from './requests/RoomManagerRequest';

export const router = express.Router();

router.get('/heartbeat', hello);
router.post('/room/create', createRoom);