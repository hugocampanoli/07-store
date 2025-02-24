import { db, Role, User, Product, ProductImage } from "astro:db";
import { v4 as UUID } from "uuid";
import bcrypt from "bcryptjs";
import { seedProducts } from "./seed-data";
import idleDirective from "astro/runtime/client/idle.js";

// https://astro.build/db/seed
export default async function seed() {
  // TODO
  const roles = [
    {
      id: "admin",
      name: "Administrator",
    },
    {
      id: "user",
      name: "Usuario",
    },
  ];

  const JohnDoe = {
    id: UUID(),
    name: "John Doe",
    email: "john.doe@gmail.com",
    password: bcrypt.hashSync("123456"),
    role: "admin",
  };
  const JaneDoe = {
    id: UUID(),
    name: "Jane Doe",
    email: "jane.doe@gmail.com",
    password: bcrypt.hashSync("123456"),
    role: "user",
  };

  await db.insert(Role).values(roles);
  await db.insert(User).values([JohnDoe, JaneDoe]);

  const queries: any = [];

  seedProducts.forEach((p) => {
    const product = {
      id: UUID(),
      description: p.description,
      gender: p.gender,
      price: p.price,
      sizes: p.sizes.join(","),
      slug: p.slug,
      stock: p.stock,
      tags: p.tags.join(","),
      title: p.title,
      type: p.type,
      user: JohnDoe.id,
    };
    queries.push(db.insert(Product).values(product));

    p.images.forEach((img) => {
      const image = {
        id: UUID(),
        image: img,
        productId: product.id,
      };
      queries.push(db.insert(ProductImage).values(image));
    });
  });

  await db.batch(queries);
}
