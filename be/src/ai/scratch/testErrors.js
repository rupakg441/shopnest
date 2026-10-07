import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import connectDB from '../../config/db.js';
import { runShoppingAgent } from '../graphs/shoppingAgentGraph.js';
import Order from '../../models/Order.js';

const test = async () => {
  await connectDB();
  const dbOrder = await Order.findOne({ status: { $ne: 'cancelled' } });
  const mockUser = dbOrder && dbOrder.user ? { _id: dbOrder.user.toString() } : { _id: '6ac3c060afede9784b23dd2a' };

  const prompts = ['cancle my order', 'cancel my order'];

  for (const prompt of prompts) {
    console.log(`\n=== Testing: "${prompt}" ===`);
    try {
      const res = await runShoppingAgent({ userMessage: prompt, user: mockUser });
      console.log('SUCCESS! Intent:', res.intent);
      console.log('Answer:', res.answer);
      console.log('Requires Confirmation:', res.requiresConfirmation);
      console.log('Confirmation Data:', res.confirmationData);
    } catch (err) {
      console.error('ERROR:', err);
    }
  }
  process.exit(0);
};

test();
