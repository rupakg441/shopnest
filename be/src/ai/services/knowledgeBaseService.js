import KnowledgeDocument from '../../models/KnowledgeDocument.js';
import { generateEmbedding } from '../embeddings/embeddingService.js';

const defaultKnowledgeDocs = [
  {
    title: 'Return Policy',
    category: 'return_policy',
    content: 'ShopNest allows returns within 30 days of delivery for most new, unopened items. Items must be in original packaging with all tags attached. Returns are free for Gold and Premium tier members.',
  },
  {
    title: 'Refund Policy',
    category: 'refund_policy',
    content: 'Refunds are processed back to your original payment method within 3 to 5 business days after our warehouse receives and inspects the returned item.',
  },
  {
    title: 'Shipping Policy',
    category: 'shipping_policy',
    content: 'Standard shipping takes 3-5 business days and is free on orders over $50. Express shipping takes 1-2 business days. International shipping takes 7-14 business days.',
  },
  {
    title: 'Warranty Policy',
    category: 'warranty',
    content: 'All electronics and premium lifestyle products sold on ShopNest carry a 1-year limited manufacturer warranty covering defects in materials and workmanship.',
  },
  {
    title: 'Customer Support & Hours',
    category: 'company_info',
    content: 'ShopNest Customer Support is available 24/7 via live AI Chat, or via email at support@shopnest.com between 8:00 AM and 8:00 PM EST daily.',
  },
];

export const seedDefaultKnowledgeDocs = async () => {
  try {
    const count = await KnowledgeDocument.countDocuments();
    if (count === 0) {
      console.log('[KnowledgeBaseService] Seeding default policy documents...');
      for (const doc of defaultKnowledgeDocs) {
        const embedding = await generateEmbedding(`${doc.title}\n${doc.content}`);
        await KnowledgeDocument.create({
          ...doc,
          embedding,
        });
      }
      console.log('[KnowledgeBaseService] Successfully seeded default knowledge documents.');
    }
  } catch (err) {
    console.error('[KnowledgeBaseService] Error seeding default knowledge:', err.message);
  }
};

export const addOrUpdateKnowledgeDoc = async (docData) => {
  const textToEmbed = `${docData.title}\n${docData.content}`;
  const embedding = await generateEmbedding(textToEmbed);

  let doc;
  if (docData._id) {
    doc = await KnowledgeDocument.findByIdAndUpdate(
      docData._id,
      { ...docData, embedding },
      { new: true, upsert: true }
    );
  } else {
    doc = await KnowledgeDocument.create({ ...docData, embedding });
  }

  return doc;
};

export const deleteKnowledgeDoc = async (id) => {
  return KnowledgeDocument.findByIdAndDelete(id);
};

export const listKnowledgeDocs = async (category) => {
  const filter = category ? { category } : {};
  return KnowledgeDocument.find(filter).sort({ createdAt: -1 });
};
