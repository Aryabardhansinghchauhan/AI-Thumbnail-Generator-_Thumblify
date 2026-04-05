import express from 'express';
import { deleteThumbnail, generateThumbnail } from '../Controller/Thumbnialcontroller.js';


const ThumbnailRouter = express.Router();

ThumbnailRouter.post('/generate', generateThumbnail);
ThumbnailRouter.delete('/delete/:id', deleteThumbnail);

export default ThumbnailRouter;