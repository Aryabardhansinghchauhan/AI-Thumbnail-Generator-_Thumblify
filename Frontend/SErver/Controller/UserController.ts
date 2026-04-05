import { Request, Response } from 'express';
import Thumbnail from '../models/Thumbnail.js';

// Controllers to get all user Thumbnails
export const getUserThumbnails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;

    const thumbnail = await Thumbnail.find({ userId }).sort({ createdAt: -1 });
    res.json({ thumbnail });

  } catch (error : any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch thumbnails', error: error.message });
    
  }
}

// controller to get single thumbnail of user 
export const getThumbnailById = async (req: Request, res: Response) => {
  try {
    const {userId} = req.session;
    const {id} = req.params;

    const thumbnail = await Thumbnail.findOne({_id: id, userId});
    res.json({thumbnail});
    
  } catch (error:any) {
    console.error(error);
    res.status(500).json({ message:error.message });
  }
}