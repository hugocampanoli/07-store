import { v2 as cloudinary } from "cloudinary";
import { log } from "node_modules/astro/dist/core/logger/core";

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});
export class imageUpload {
  static async uploadImage(file: File) {
    const buffer = await file.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    const imageType = file.type.split("/")[1];
    const resp = await cloudinary.uploader.upload(
      `data:image/${imageType};base64,${base64Image}`
    );

    return resp.secure_url;
  }
  static async delete(image: string) {
    try {
      const imageName = image.split("/").pop() ?? "";
      const imageId = image.split(".")[0];
      const resp = await cloudinary.uploader.destroy(imageId);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
