"use server";

import { s3Client } from "@/lib/aws/aws-client";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Delete a file from S3 using its object key.
 * @param key The S3 object key (e.g., the filename stored).
 */
export const deleteFromS3 = async (key: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
      Key: key,
    });

    await s3Client.send(command);

    return { success: true };
  } catch (error: any) {
    console.error("deleteFromS3 error", error);
    return { success: false, error: error.message };
  }
};

function sanitizeFilename(originalName: string): string {
  const name = originalName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-_]/g, "");
  return `file-${Date.now()}-${name}`;
}

export const getSignUrls = async (
  files: { filename: string; fileType: string }[]
) => {
  try {
    const urls = await Promise.all(
      files.map(async ({ filename, fileType }) => {
        const key = sanitizeFilename(filename);

        const command = new PutObjectCommand({
          Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
          Key: key,
          ContentType: fileType,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        return {
          filename,
          key,
          url,
          publicUrl: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`,
        };
      })
    );

    return { success: true, urls };
  } catch (err: any) {
    console.error("getSignUrls error", err);
    return { success: false, error: err.message };
  }
};

export async function POST(req: Request) {
  const { filename, fileType } = await req.json();

  const key = `audio-${Date.now()}-${filename}`;
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
    Key: key,
    ContentType: fileType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return Response.json({
    key,
    url,
    publicUrl: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`,
  });
}
