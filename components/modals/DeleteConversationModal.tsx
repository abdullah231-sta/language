// components/modals/DeleteConversationModal.tsx

interface DeleteConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  conversationName: string;
}

const DeleteConversationModal = ({ isOpen, onClose, onConfirm, conversationName }: DeleteConversationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">Delete Conversation</h2>
        <p className="text-gray-700">
          Are you sure you want to delete your entire conversation with <strong>{conversationName}</strong>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Yes, Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConversationModal;