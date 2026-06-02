import { RoleRepo } from "../repositories/role.repository.js";
import { Prisma } from "@prisma/client";

const roleRepo = new RoleRepo();

export class RoleService {
    async create(data: Prisma.RoleCreateInput) {
        if (!data.name) throw new Error("ກະລຸນາໃສ່ຊື່ Role!");
        
        // ປ່ຽນເປັນໂຕພິມໃຫຍ່ທັງໝົດເພື່ອຄວາມເປັນລະບົບ ເຊັ່ນ: admin -> ADMIN
        const roleName = data.name.toUpperCase().trim();
        
        return await roleRepo.createRole({
            ...data,
            name: roleName
        });
    }

    async getAll() {
        return await roleRepo.getAllRoles();
    }

    // get one role
    async getById(id: number) {
        return await roleRepo.getOneRole(id);
    }

    // update role
    async update(id: number, data: Prisma.RoleUpdateInput) {
        if (typeof data.name === "string") {
            data.name = data.name.toUpperCase().trim();
        } else if (typeof data.name === "object" && data.name !== null && "set" in data.name) {
            data.name.set = (data.name.set as string).toUpperCase().trim();
        }
        return await roleRepo.updateRole(id, data);
    }

    // delete role
    async delete(id: number) {
        return await roleRepo.deleteRole(id);
    }

}
