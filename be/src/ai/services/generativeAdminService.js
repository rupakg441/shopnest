import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { getChatModel } from '../config/llmConfig.js';

export const generateAdminProductContent = async ({ title, category, brand, features = [], currentDescription = '' }) => {
  const model = getChatModel({ temperature: 0.7 });

  const fallbackResult = {
    shortDescription: `${brand || ''} ${title} delivers exceptional performance in ${category || 'lifestyle'}. Crafted with premium material and designed for daily utility.`.trim(),
    detailedDescription: `${title} by ${brand || 'ShopNest'} is built for modern living. Designed specifically for ${category || 'general use'}, it combines style, durable materials, and intuitive function to elevate your experience.\n\nKey Highlights:\n- High quality engineering\n- Built for long-lasting utility\n- Sleek, modern aesthetic`,
    seoTitle: `${title} | Premium ${category || 'Essentials'} by ${brand || 'ShopNest'}`,
    seoDescription: `Discover ${title} from ${brand || 'ShopNest'}. Enjoy high performance, premium quality, and free shipping on qualifying orders.`,
    metaKeywords: [title, category, brand, 'buy online', 'ShopNest', 'best price'].filter(Boolean).join(', '),
    faqs: [
      { question: `Is ${title} under warranty?`, answer: 'Yes, it includes a 1-year ShopNest warranty covering manufacturing defects.' },
      { question: 'What is the return policy?', answer: 'You can return unopened items within 30 days of delivery.' },
    ],
    marketingCopy: `Upgrade your lifestyle with ${title}. Experience top-tier design and uncompromised quality today!`,
  };

  if (!model) {
    return fallbackResult;
  }

  try {
    const prompt = `You are a professional e-commerce copywriter and SEO specialist.
Generate product copy and SEO metadata for:
- Product Title: ${title}
- Category: ${category || 'N/A'}
- Brand: ${brand || 'N/A'}
- Features/Highlights: ${features.join(', ') || 'N/A'}
- Existing Context: ${currentDescription || 'N/A'}

Respond strictly with a valid JSON object matching this structure:
{
  "shortDescription": "1-2 sentence compelling summary",
  "detailedDescription": "Structured, multi-paragraph description with features and benefits",
  "seoTitle": "Under 60 chars title",
  "seoDescription": "Under 155 chars meta description",
  "metaKeywords": "comma, separated, keywords",
  "faqs": [{"question": "...", "answer": "..."}],
  "marketingCopy": "Punchy 2-sentence ad copy"
}`;

    const response = await model.invoke([
      new SystemMessage('Return only valid, unparsed JSON. Do not include markdown code block tags if possible, or wrap in ```json.'),
      new HumanMessage(prompt),
    ]);

    const rawText = response.content.toString().replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(rawText);
    return { ...fallbackResult, ...parsed };
  } catch (err) {
    console.warn('[GenerativeAdminService] LLM JSON generation failed, returning grounded template:', err.message);
    return fallbackResult;
  }
};
