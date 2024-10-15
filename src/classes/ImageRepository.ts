import { Binary } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

export class ImageRepository {
      private static instance: ImageRepository;
      private constructor() {
            cloudinary.config({
                  secure: true,
            });
      }

      static getInstance() {
            if (!ImageRepository.instance) {
                  ImageRepository.instance = new ImageRepository();
            }

            return ImageRepository.instance;
      }

      async uploadImage(folder: string, name: string, image: Binary) {
            const upload = await new Promise((resolve) => {
                  cloudinary.uploader
                        .upload_stream(
                              {
                                    folder: folder,
                                    public_id: name,
                                    filename_override: name,
                                    overwrite: true,
                                    resource_type: "image",
                                    use_asset_folder_as_public_id_prefix: true,
                              },
                              (error, uploadResult) => {
                                    return resolve(uploadResult);
                              }
                        )
                        .end(image.buffer);
            });

            return (upload as any).secure_url;
      }
}
