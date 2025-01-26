import { createUser, loginUser } from '#@/controllers/user.controller';
import express from 'express';

const userRouter = express.Router();

userRouter.post('/users', createUser);
userRouter.post('/login', loginUser);

export default userRouter;
