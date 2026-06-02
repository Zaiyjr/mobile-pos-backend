import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";


export class CategoryRepo {

    // ສຳລັບການສ້າງຫມວດຫມູ່
    async createCategory(data: Prisma.CategoryCreateInput) {
        return await prisma.category.create({
            data: data,
        })
    }
    // ສຳລັບການດຶງຫມວດຫມູ່ທັງຫມົດ
    async getAllCategory() {
       return await prisma.category.findMany();
    }

    // ສຳລັບການດຶງຫມວດຫມູ່ຫນື່ງອັນ
    async getOneCategory(id:number) {
        return await prisma.category.findUnique({
            where: {
                id: id
            }
            
        })
    }

    // ສຳລັບການແກ້ໄຂ
    async updateCategory(id: number, data: Prisma.CategoryUpdateInput) {
        return await prisma.category.update({
            where: { id: id },
            data: data,
        })
    }

    // ສຳລັບການລົບ
    async deleteCategory(id: number) {
        return await prisma.category.delete({
            where: { id: id },
        })
    }
}

