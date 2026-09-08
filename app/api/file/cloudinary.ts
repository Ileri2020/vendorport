import { v2 as cloudinaryV2 } from "cloudinary";

const targetCloudName = (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "").trim();
const publicTargetCloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "").trim();

if (!targetCloudName) throw new Error("A destination Cloudinary cloud name is required.");
if (publicTargetCloudName && publicTargetCloudName !== targetCloudName) {
  throw new Error("Cloudinary cloud configuration mismatch.");
}

cloudinaryV2.config({
  cloud_name: targetCloudName,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function handleUpload(file: string) {
  const res = await cloudinaryV2.uploader.upload(file, {
    resource_type: "auto",
  });
  const uploadedUrl = res.secure_url || res.url || "";
  if (!uploadedUrl.includes(`res.cloudinary.com/${targetCloudName}/`)) {
    throw new Error("Cloudinary returned an image URL from an unexpected cloud.");
  }
  return res;
}