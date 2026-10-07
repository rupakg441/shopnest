import Product from '../../models/Product.js';
import ProductEmbedding from '../../models/ProductEmbedding.js';
import { getEmbeddingsModel, FallbackEmbeddings } from '../config/llmConfig.js';
import { upsertProductVectors } from '../vector/vectorStoreService.js';

export const buildProductTextDocument = (product) => {
  const parts = [
    `Title: ${product.title || product.name || ''}`,
    `Brand: ${product.brand || 'Generic'}`,
    `Category: ${product.category || 'General'}`,
    `Price: $${(product.price || 0).toFixed(2)}`,
    `Stock: ${product.stock ?? 10} items`,
    `Rating: ${product.rating || 0} / 5 (${product.reviewsCount || 0} reviews)`,
    `Description: ${product.description || ''}`,
  ];

  if (Array.isArray(product.tags) && product.tags.length) {
    parts.push(`Tags: ${product.tags.join(', ')}`);
  }
  if (Array.isArray(product.colors) && product.colors.length) {
    parts.push(`Available Colors: ${product.colors.join(', ')}`);
  }
  if (Array.isArray(product.sizes) && product.sizes.length) {
    parts.push(`Available Sizes: ${product.sizes.join(', ')}`);
  }
  if (product.details) {
    const detailsStr = Object.entries(product.details)
      .filter(([_, val]) => Boolean(val))
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
    if (detailsStr) parts.push(`Specifications: ${detailsStr}`);
  }

  return parts.join('\n');
};

export const generateEmbedding = async (text) => {
  try {
    const embeddings = getEmbeddingsModel();
    return await embeddings.embedQuery(text);
  } catch (err) {
    console.warn('[EmbeddingService] Provider embedQuery failed, using FallbackEmbeddings:', err.message);
    const fallback = new FallbackEmbeddings();
    return await fallback.embedQuery(text);
  }
};

export const indexSingleProduct = async (product) => {
  try {
    const textDocument = buildProductTextDocument(product);
    const vector = await generateEmbedding(textDocument);
    const productIdStr = product._id ? product._id.toString() : String(product.id);

    // Upsert into MongoDB vector cache
    await ProductEmbedding.findOneAndUpdate(
      { productIdStr },
      {
        product: product._id,
        productIdStr,
        textDocument,
        category: product.category,
        brand: product.brand,
        price: product.price,
        rating: product.rating || 0,
        embedding: vector,
        metadata: {
          title: product.title || product.name,
          stock: product.stock,
          image: product.image,
        },
      },
      { upsert: true, new: true }
    );

    // Upsert into production vector store
    await upsertProductVectors([
      {
        id: productIdStr,
        vector,
        metadata: {
          productId: productIdStr,
          title: product.title || product.name,
          category: product.category || '',
          brand: product.brand || '',
          price: Number(product.price || 0),
          rating: Number(product.rating || 0),
          stock: Number(product.stock || 0),
          image: product.image || '',
        },
      },
    ]);

    return { success: true, productId: productIdStr };
  } catch (error) {
    console.error(`[EmbeddingService] Failed to index product ${product._id}:`, error.message);
    return { success: false, error: error.message };
  }
};

export const indexAllProducts = async () => {
  try {
    const products = await Product.find({});
    console.log(`[EmbeddingService] Indexing ${products.length} catalog products...`);
    let indexed = 0;
    for (const product of products) {
      const res = await indexSingleProduct(product);
      if (res.success) indexed++;
    }
    console.log(`[EmbeddingService] Successfully indexed ${indexed}/${products.length} products.`);
    return { success: true, total: products.length, indexed };
  } catch (error) {
    console.error('[EmbeddingService] Failed to index all products:', error.message);
    return { success: false, error: error.message };
  }
};
