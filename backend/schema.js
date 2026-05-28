// backend/schema.js
export const typeDefs = `#graphql
  # 1. Definisi Entitas Barang Gudang
  type Item {
    id: ID!
    sku: String!
    name: String!
    quantity: Int!
    status: String! 
  }

  # 2. Query (Minimal 1)
  type Query {
    # Mengambil daftar barang yang jumlahnya di bawah batas aman (restock alert)
    getLowStockItems: [Item]
  }

  # 3. Mutation (Minimal 2)
  type Mutation {
    # Mencatat kedatangan barang dari supplier (menambah stok)
    recordIncomingGoods(sku: String!, name: String!, quantity: Int!): Item
    
    # Mencatat pengiriman barang ke cabang (mengurangi stok)
    dispatchGoods(sku: String!, dispatchQuantity: Int!): Item
  }
`;