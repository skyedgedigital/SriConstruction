import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from  '@aws-sdk/s3-request-presigner';
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export default s3Client;

export async function getObjectURL(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
    Key: key,
  });

  const signedURL = await getSignedUrl(s3Client, command);
  return signedURL;
}
