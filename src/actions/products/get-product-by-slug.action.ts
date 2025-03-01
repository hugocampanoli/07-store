import { defineAction } from "astro:actions";
import { db, eq, Product, ProductImage } from "astro:db";
import { z } from "astro:schema";

const newProduct = {
  id: "",
  description: "Nuevo Descripcion",
  gender: "men",
  price: 0,
  sizes: "XS,S,M,L,XL,XXL",
  slug: "nuevo-producto",
  stock: 0,
  tags: "shirts,new",
  title: "Nuevo Producto",
  type: "shirts",
};

export const getProductBySlug = defineAction({
  accept: "json",
  input: z.string(),
  handler: async (slug) => {
    if (slug === "new") {
      return {
        product: newProduct,
        images: [],
      };
    }
    const [product] = await db
      .select()
      .from(Product)
      .where(eq(Product.slug, slug));

    if (!product) {
      throw new Error(`Product with ${slug} not found`);
    }

    const images = await db
      .select()
      .from(ProductImage)
      .where(eq(ProductImage.productId, product.id));

    return {
      product: product,
      images: images.map((img) => img.image),
    };
  },
});
