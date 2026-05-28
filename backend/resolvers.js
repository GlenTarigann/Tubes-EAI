import { Item } from './models/Item.js';

export const resolvers = {
  Query: {
    // Menerjemahkan Query GraphQL menjadi instruksi ke Database
    getLowStockItems: async () => {
      // Mengambil barang dengan kuantitas di bawah 50
      return await Item.find({ quantity: { $lt: 50 } }); 
    },
  },
  
  Mutation: {
    recordIncomingGoods: async (_, { sku, name, quantity }) => {
      // Cek apakah barang sudah ada di database
      let item = await Item.findOne({ sku });
      if (item) {
        item.quantity += quantity; // Tambah stok
      } else {
        item = new Item({ sku, name, quantity, status: 'RECEIVED' }); // Barang baru
      }
      return await item.save();
    },

    dispatchGoods: async (_, { sku, dispatchQuantity }) => {
      const item = await Item.findOne({ sku });
      if (!item) throw new Error("Barang tidak ditemukan di gudang!");
      if (item.quantity < dispatchQuantity) throw new Error("Stok tidak mencukupi!");
      
      item.quantity -= dispatchQuantity;
      if (item.quantity === 0) item.status = 'OUT_OF_STOCK';
      
      return await item.save();
    }
  }
};