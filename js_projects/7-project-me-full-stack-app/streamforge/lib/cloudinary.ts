import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Generate a signed upload signature.
 *
 * Rules:
 * - Only include params that will ALSO be sent in the browser FormData.
 * - resource_type is NOT part of the signed params (it goes in the URL, not the body).
 * - folder IS signed and must match the FormData value exactly.
 */
export function generateUploadSignature(params: {
  folder: string;
  [key: string]: string | number;
}) {
  const timestamp = Math.round(Date.now() / 1000);

  // resource_type must be excluded from the signature params —
  // it is part of the upload URL, not the POST body.
  const { resource_type, ...paramsToSign } = params as any;

  const signature = cloudinary.utils.api_sign_request(
    { ...paramsToSign, timestamp },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
  };
}
