import { db, Role, User } from "astro:db";
import { v4 as UUID } from "uuid";
import bcrypt from "bcryptjs";

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
}
