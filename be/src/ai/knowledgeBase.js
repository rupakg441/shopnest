import Page from '../models/Page.js';

const tokenize = (value) => new Set(value.toLowerCase().match(/[a-z0-9]+/g) || []);

/** Retrieve only published ShopNest CMS content; unpublished drafts stay private. */
export const retrieveKnowledge = async (query, limit = 3) => {
  const queryTokens = tokenize(query);
  if (!queryTokens.size) return [];

  const pages = await Page.find({ isPublished: true })
    .select('slug title content updatedAt')
    .sort({ updatedAt: -1 })
    .limit(500)
    .lean();

  return pages
    .map((page) => {
      const titleTokens = tokenize(`${page.slug} ${page.title}`);
      const contentTokens = tokenize(page.content);
      const score = [...queryTokens].reduce((total, token) => (
        total + (titleTokens.has(token) ? 3 : 0) + (contentTokens.has(token) ? 1 : 0)
      ), 0);

      return {
        id: page._id.toString(),
        title: page.title,
        content: page.content,
        score,
      };
    })
    .filter((document) => document.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, Math.min(10, limit)));
};
