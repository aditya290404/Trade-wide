import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock_access_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock_secret_key',
  },
  // If keys are mocked, do not actually attempt to hit real AWS endpoint.
  // We'll gracefully bypass the actual upload logic below instead.
});

export const uploadToS3 = async (bucketName: string, fileKey: string, fileBuffer: Buffer, mimetype: string) => {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    console.log(`[AWS S3 Mock] Uploading ${fileKey} to ${bucketName} (Mocked successfully, supply valid AWS keys to persist)`);
    return {
      success: true,
      url: `https://${bucketName}.s3.amazonaws.com/${fileKey} (Mocked URL)`
    };
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  try {
    await s3Client.send(command);
    return {
      success: true,
      url: `https://${bucketName}.s3.amazonaws.com/${fileKey}`
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload file to S3');
  }
};
