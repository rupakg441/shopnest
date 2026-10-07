import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import connectDB from '../../config/db.js';
import { runShoppingAgent } from '../graphs/shoppingAgentGraph.js';

const test = async () => {
  await connectDB();
  const mockUser = { name: 'John Doe', email: 'john@example.com', _id: '6ac3c060afede9784b23dd2a' };

  const prompts = ['Find me a good laptop', 'Find me a good Napkin Set'];

  for (const prompt of prompts) {
    console.log(`\n=== Testing: "${prompt}" ===`);
    try {
      const res = await runShoppingAgent({ userMessage: prompt, user: mockUser });
      console.log('SUCCESS! Intent:', res.intent);
      console.log('Answer:', res.answer);
      console.log('Products Count:', res.products.length);
      if (res.products.length) {
        console.log('Products found:', res.products.map(p => p.title));
      }
    } catch (err) {
      console.error('ERROR:', err);
    }
  }
  process.exit(0);
};

test();
