import prisma from "../config/prisma.js";
import { Prisma } from "@prisma/client";

export class BrandRepo {
    // ສຳລັບການສ້າງ Brand
    async createBrand(data: Prisma.BrandCreateInput) {
        return await prisma.brand.create({
            data: data,
        })
    }
    // ສຳລັບການດຶງ Brand ທັງຫມົດ
    async getAllBrand() {
       return await prisma.brand.findMany();
    }

    // ສຳລັບການດຶງ Brand ຫນື່ງอัน
    async getOneBrand(id:number) {
        return await prisma.brand.findUnique({
            where: {
                id: id
            }
            
        })
    }

    // ສຳລັບການແກ້ໄຂ
    async updateBrand(id: number, data: Prisma.BrandUpdateInput) {
        return await prisma.brand.update({
            where: { id: id },
            data: data,
        })
    }

    // ສຳລັບການລົບ
    async deleteBrand(id: number) {
        return await prisma.brand.delete({
            where: { id: id },
        })
    }
}
