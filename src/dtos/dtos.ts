// DTO ສຳລັບການ Checkout ປິດບິນຢູ່ໜ້າ POS
export interface CreateOrderDTO {
    employeeId: number; // ID ພະນັກງານຄົນຂາຍ
    customerId?: number; // ID ລູກຄ້າ (Optional - ບາງເທື່ອລູກຄ້າທົ່ວໄປບໍ່ລົງທະບຽນ)
    totalAmount: number; // ຍອດລວມທັງໝົດທີ່ເກັບເງິນມາ
    
    // ລາຍການສິນຄ້າໃນບິນ
    items: {
        variantId: number;
        quantity: number;
        priceAtTime: number; // ລາຄາສິນຄ້າຕອນທີ່ຂາຍ
        
        // ປ້ອນເລກ ID ຂອງ StockItem (IMEI) ທີ່ເລືອກຂາຍອອກໄປ
        stockItemIds: number[]; 
    }[];
}