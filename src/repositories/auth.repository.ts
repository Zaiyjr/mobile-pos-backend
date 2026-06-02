import prisma from "../config/prisma.js";
import { Prisma } from "@prisma/client";

export class AuthRepo {
  // register
  async register(data: Prisma.UserCreateInput) {
    return await prisma.user.create({
      data: data,
    });
  }
  // login
  async login(username: string) {
    return await prisma.user.findFirst({
      where: {
        username: username,
        isDeleted: false,
      },
      include: {
        role: true,
      },
    });
  }

  async getRoleByName(name: string) {
    return await prisma.role.findUnique({
      where: { name },
    });
  }
}
