import type { CartItem } from "@/interfaces";
import { defineAction } from "astro:actions";
import { db, eq, inArray, Product, ProductImage } from "astro:db";
import { z } from "astro:schema";

export const loadProductsFromCart = defineAction({
  accept: "json",
  //   input: z.string(),
  input: z.array(
    z.object({
      productId: z.string(),
      size: z.string(),
      quantity: z.number(),
    })
  ),
  handler: async (cart, { cookies }) => {
    //  console.log({ cart });
    // const cart = JSON.parse(cookies.get("cart")?.value ?? "[]") as CartItem[];
    if (cart.length === 0) return [];

    //load productos
    const productIds = cart.map((i) => i.productId);
    const dbProducts = await db
      .select()
      .from(Product)
      .innerJoin(ProductImage, eq(Product.id, ProductImage.productId))
      .where(inArray(Product.id, productIds));

    // console.log("desde base de datos", dbProducts);

    return cart.map((item) => {
      const dbProduct = dbProducts.find((p) => p.Product.id === item.productId);
      if (!dbProduct) {
        throw new Error(`Product ID ${item.productId} not Found!`);
      }
      const { title, price, slug } = dbProduct.Product;
      const image = dbProduct.ProductImage.image;
      return {
        productId: item.productId,
        title: title,
        size: item.size,
        quantity: item.quantity,
        image: image.startsWith("http")
          ? image
          : `${import.meta.env.PUBLIC_URL}/images/products/${image}`,
        price: price,
        slug: slug,
      };
    });
  },
});
