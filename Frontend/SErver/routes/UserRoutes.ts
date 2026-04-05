import express from 'express';
import User from '../models/User.js';
import { getUserThumbnails,getThumbnailById
 } from '../Controller/UserController.js';

const UserRouter = express.Router();

UserRouter.get('/thumbnails',getUserThumbnails)
UserRouter.get('/thumbnails/:id', getThumbnailById)

export default UserRouter;