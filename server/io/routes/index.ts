import express from 'express';
import { hello } from './requests/HelloWorld';

export const router = express.Router();

router.get('/HelloWorld', hello);