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
  console.log('Testing: "my name"');
  try {
    const res = await runShoppingAgent({ userMessage: 'my name', user: mockUser });
    console.log('SUCCESS! Intent:', res.intent);
    console.log('Answer:', res.answer);
    console.log('Answer type:', typeof res.answer);
  } catch (err) {
    console.error('ERROR:', err);
  }
  process.exit(0);
};

test();
