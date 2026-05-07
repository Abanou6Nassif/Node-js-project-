
import express from 'express';
import { voteQuestion , voteAnswer } from '../controller/vote.controller.js';
import { auth } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post('/:id/vote', auth, voteQuestion); 
router.post('/:questionId/answers/:answerId/vote', auth, voteAnswer); 

export default router;