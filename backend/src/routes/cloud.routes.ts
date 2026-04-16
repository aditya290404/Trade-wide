import express from 'express';
import multer from 'multer';
import { uploadToS3 } from '../services/s3.service';

const router = express.Router();

// Memory storage for immediate buffer access before AWS S3 upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const bucketName = process.env.AWS_S3_BUCKET || 'tradewide-assets';
    const result = await uploadToS3(bucketName, file.originalname, file.buffer, file.mimetype);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

export default router;
