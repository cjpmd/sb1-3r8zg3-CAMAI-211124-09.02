import express from 'express';
import tokenHandler from './token';

const router = express.Router();

router.post('/token', tokenHandler);

export default router;
