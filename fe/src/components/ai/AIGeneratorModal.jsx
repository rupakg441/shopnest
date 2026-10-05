import React, { useState } from 'react';
import { Sparkles, Check, X, Copy, RefreshCw } from 'lucide-react';
import { useGenerateAdminAIContentMutation } from '../../features/ai/aiApi';

const AIGeneratorModal = ({ isOpen, onClose, productData, onApply }) => {
  const [generateAI, { isLoading }] = useGenerateAdminAIContentMutation();
  const [generatedContent, setGeneratedContent] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      const res = await generateAI({
        title: productData.title || productData.name || 'Product',
        category: productData.category || '',
        brand: productData.brand || '',
        features: productData.tags || [],
        currentDescription: productData.description || '',
      }).unwrap();

      setGeneratedContent(res.data);
    } catch (err) {
      alert(err?.data?.message || 'Failed to generate AI content.');
    }
  };

  const handleApplyAll = () => {
    if (generatedContent && onApply) {
      onApply(generatedContent);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-surface p-6 rounded-2xl max-w-2xl w-full border border-outline-variant shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40">
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <Sparkles className="w-5 h-5 fill-primary text-primary" />
            <span>AI Product Copy & SEO Generator</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-high">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-sm">
          {!generatedContent && !isLoading && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-primary/40 mx-auto mb-3" />
              <p className="text-on-surface-variant font-medium">
                Generate SEO title, meta description, product FAQs, and marketing copy for <strong>{productData.title || 'this product'}</strong>.
              </p>
              <button
                onClick={handleGenerate}
                className="mt-4 inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold hover:bg-neutral-800 transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Generate AI Copy
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-on-surface-variant font-medium">Crafting SEO copy and detailed description...</p>
            </div>
          )}

          {generatedContent && (
            <div className="space-y-4">
              <div className="p-3 bg-surface-container rounded-xl">
                <label className="text-xs font-bold text-on-surface-variant uppercase">SEO Title</label>
                <p className="text-sm font-semibold text-on-surface mt-1">{generatedContent.seoTitle}</p>
              </div>

              <div className="p-3 bg-surface-container rounded-xl">
                <label className="text-xs font-bold text-on-surface-variant uppercase">SEO Description</label>
                <p className="text-sm text-on-surface mt-1">{generatedContent.seoDescription}</p>
              </div>

              <div className="p-3 bg-surface-container rounded-xl">
                <label className="text-xs font-bold text-on-surface-variant uppercase">Detailed Description</label>
                <p className="text-sm text-on-surface whitespace-pre-line mt-1">{generatedContent.detailedDescription}</p>
              </div>

              <div className="p-3 bg-surface-container rounded-xl">
                <label className="text-xs font-bold text-on-surface-variant uppercase">Marketing Copy</label>
                <p className="text-sm italic text-on-surface mt-1">"{generatedContent.marketingCopy}"</p>
              </div>
            </div>
          )}
        </div>

        {generatedContent && (
          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/40">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-outline/30 text-on-surface hover:bg-surface-container-high"
              >
                Cancel
              </button>

              <button
                onClick={handleApplyAll}
                className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 text-xs font-semibold rounded-lg hover:bg-neutral-800"
              >
                <Check className="w-4 h-4" /> Apply to Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGeneratorModal;
