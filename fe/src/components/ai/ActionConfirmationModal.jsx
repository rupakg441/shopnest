import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useExecuteToolActionMutation } from '../../features/ai/aiApi';

const ActionConfirmationModal = ({ confirmation, onConfirm, onCancel }) => {
  const [executeTool, { isLoading }] = useExecuteToolActionMutation();

  if (!confirmation) return null;

  const handleExecute = async () => {
    try {
      const res = await executeTool({
        toolName: confirmation.action,
        args: { orderIdentifier: confirmation.orderIdentifier, confirmed: true },
      }).unwrap();

      onConfirm(res.result?.message || `Successfully executed ${confirmation.action}`);
    } catch (err) {
      alert(err?.data?.message || 'Failed to execute action.');
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-surface p-6 rounded-2xl max-w-md w-full border border-outline-variant shadow-xl">
        <div className="flex items-center gap-3 text-error mb-3">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <h3 className="text-base font-bold text-on-surface">Confirmation Required</h3>
        </div>

        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
          {confirmation.message || `Are you sure you want to proceed with ${confirmation.action}?`}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-outline/30 text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <XCircle className="w-4 h-4" /> Cancel
          </button>

          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-error text-on-error hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            {isLoading ? 'Processing...' : 'Confirm Action'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmationModal;
