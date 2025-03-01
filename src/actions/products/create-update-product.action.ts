import { imageUpload } from "@/utils/image-upload";
import { defineAction } from "astro:actions";
import { db, eq, Product, ProductImage } from "astro:db";
import { z } from "astro:schema";
import { getSession } from "auth-astro/server";
import { v4 as UUID } from "uuid";

const MAX_FILE_SIZE = 5_000_000; //5 MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

export const createUpdateProduct = defineAction({
  accept: "form",
  input: z.object({
    id: z.string().optional(),
    description: z.string(),
    gender: z.string(),
    price: z.number(),
    sizes: z.string(),
    slug: z.string(),
    stock: z.number(),
    tags: z.string(),
    title: z.string(),
    type: z.string(),

    imageFiles: z
      .array(
        z
          .instanceof(File)
          .refine((file) => file.size <= MAX_FILE_SIZE, "Max Image Size 5MB")
          .refine((file) => {
            if (file.size === 0) return true;
            return ACCEPTED_IMAGE_TYPES.includes(file.type);
          }, `Invalid Image Type, Accepted types are ${ACCEPTED_IMAGE_TYPES.join(", ")}`)
      )
      .optional(),
  }),
  handler: async (form, { request }) => {
    const session = await getSession(request);
    const user = session?.user;
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { id = UUID(), imageFiles, ...rest } = form;
    rest.slug = rest.slug.toLowerCase().replaceAll(" ", "-").trim();
    const product = {
      id: id,
      user: user.id!,
      ...rest,
    };
    //await db.update(Product).set(product).where(eq(Product.id, id));

    const queries: any = [];
    if (!form.id) {
      queries.push(db.insert(Product).values(product));
    } else {
      queries.push(db.update(Product).set(product).where(eq(Product.id, id)));
    }

    //Imagenes
    // console.log({ imageFiles });
    //Update Products
    // imageFiles?.forEach(async (imageFile) => {
    //   if (imageFile.size <= 0) {
    //     return;
    //   }
    //   const url = await imageUpload.uploadImage(imageFile);
    // });
    const secureURLs: string[] = [];
    if (
      form.imageFiles &&
      form.imageFiles.length > 0 &&
      form.imageFiles[0].size > 0
    ) {
      const urls = await Promise.all(
        form.imageFiles.map((file) => imageUpload.uploadImage(file))
      );
      secureURLs.push(...urls);
    }
    secureURLs.forEach((imageURL) => {
      const imageObj = {
        id: UUID(),
        productId: product.id,
        image: imageURL,
      };
      queries.push(db.insert(ProductImage).values(imageObj));
    });
    await db.batch(queries);
    return product;
  },
});
