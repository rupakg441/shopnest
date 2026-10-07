import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../../config/db.js';
import { runShoppingAgent } from '../graphs/shoppingAgentGraph.js';
import User from '../../models/User.js';

const runTest = async () => {
  await connectDB();
  const dbUser = await User.findOne({});
  const mockUser = dbUser || { _id: '6ac3c060afede9784b23dd2a' };

  console.log('--- Test 1: Order Amount Query ---');
  const res1 = await runShoppingAgent({ userMessage: 'How much ammount of orders i have ordered', user: mockUser });
  console.log('Intent:', res1.intent);
  console.log('Answer:\n', res1.answer);

  console.log('\n--- Test 2: Leather Sandals Query ---');
  const res2 = await runShoppingAgent({ userMessage: 'leather sandals with good support', user: mockUser });
  console.log('Intent:', res2.intent);
  console.log('Answer:\n', res2.answer);
  console.log('Products found:', res2.products.length);

  process.exit(0);
};

runTest().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
