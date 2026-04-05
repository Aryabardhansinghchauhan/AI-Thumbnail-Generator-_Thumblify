import { Request, Response } from 'express';
import Thumbnail from '../models/Thumbnail.js';
import { GenerateContentConfig, HarmBlockThreshold, HarmCategory } from '@google/genai';
import ai from '../configs/ai.js';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const stylePrompts = {
  'Bold & Graphic': 'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
  'Tech/Futuristic': 'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
  'Minimalist': 'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
  'Photorealistic': 'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
  'Illustrated': 'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style'
}

const colorSchemeDescriptions = {
  vibrant: 'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
  sunset: 'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
  forest: 'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
  neon: 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
  purple: 'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
  monochrome: 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
  ocean: 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
  pastel: 'soft pastel colors, low saturation, gentle tones, friendly aesthetic'
};

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const{userId} = req.session;
    const { title,
      prompt:user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;

      const thumbnail = await Thumbnail.create({
        userId,
        title,
        prompt_used: user_prompt,
        user_prompt,
        style,
        aspect_ratio,
        color_scheme,
        text_overlay,
        isGenerating: true,
      })
      const model = 'gemini-3.1-flash-image-preview';
      const generationConfig : GenerateContentConfig ={
        maxOutputTokens: 32777,
        temperature: 1,
        topP: 0.95,
        responseModalities:['IMAGE'],
        imageConfig:{
          aspectRatio : aspect_ratio || '16:9',
          imageSize: '1K'
        },
        safetySettings:[
          {category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.OFF},
          {category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.OFF},
          {category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.OFF},
          {category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.OFF},
        ]
      }

      let prompt = `Create "${stylePrompts[style as keyof typeof stylePrompts]} for "${title}"`;
      if(color_scheme){
        prompt += ` using a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`
      }

      if(user_prompt){
        prompt += `Additional details: ${user_prompt}`;
      }
      prompt += `The Thumbnail should be ${aspect_ratio}, with the title prominently displayed. If text overlay is enabled, include engaging text that complements the title and style. The design should be optimized for click-through rates and visually appealing to the target audience.`

      // generate the image using Gemini
      const response = await ai.models.generateContent({
        model, 
        contents: [prompt], 
        config: generationConfig});

        // check if response is right 
        if(!response?.candidates?.[0]?.content?.parts){
          throw new Error('Invaild response');
        }

        const parts = response.candidates[0].content.parts;

        let finalBuffer: Buffer | null = null;

       for (const part of parts) {
           if (part.inlineData?.data) {
             finalBuffer = Buffer.from(part.inlineData.data, 'base64');
              }
            }

        const filename = `final-output-${Date.now()}.png`;
        const filePath = path.join('images', filename);

        // create the image directory if it doesn't exist
        fs.mkdirSync
        ('images', {recursive: true});

        //final image 
        fs.writeFileSync(filePath, finalBuffer!);
        
        const uploadResult = await cloudinary.uploader.upload(filePath, {resource_type: 'image', folder: 'thumbnails'});

        thumbnail.image_url = uploadResult.url;
        thumbnail.isGenerating = false;
        await thumbnail.save();

        res.json({message:"Thumbnail generated successfully", thumbnail});

        // remove image file from disk 
        fs.unlinkSync(filePath)

  } catch (error: any) {
    console.error( error);
    res.status(500).json({ message: 'Failed to generate thumbnail', error: error.message });
  }
}

//controller to delete the thumbnail
export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {userId} = req.session;

    await Thumbnail.findByIdAndDelete({_id: id, userId});

    res.json({ message: 'Thumbnail deleted successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete thumbnail', error: error.message });
  }
}
  