import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  status: { type: String, default: 'IN_STOCK' }
});

export const Item = mongoose.model('Item', itemSchema);