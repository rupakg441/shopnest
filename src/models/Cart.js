import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: [1, 'Quantity must be at least 1']
        },
        color: {
          type: String
        },
        size: {
          type: String
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
