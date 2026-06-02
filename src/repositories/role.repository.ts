import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";

export class RoleRepo {
    // create role
    async createRole(data: Prisma.RoleCreateInput){
        return await prisma.role.create({
            data: data,
        })
    }
    // get all role
    async getAllRoles(){
        return await prisma.role.findMany()
    }

    // get one role
    async getOneRole(id: number) {
        return await prisma.role.findUnique({
            where: {
                id: id
            }
        })
    }

    // update role
    async updateRole(id: number, data: Prisma.RoleUpdateInput) {
        return await prisma.role.update({
            where: { id: id },
            data: data,
        })
    }

    // delete role
    async deleteRole(id: number) {
        return await prisma.role.delete({
            where: { id: id },
        })
    }
}