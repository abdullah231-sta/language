// components/modals/DeleteModal.tsx

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteModal = ({ isOpen, onClose }: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">Delete Account</h2>
        <p className="text-gray-700">Are you absolutely sure you want to delete your account? This action is irreversible and all your data will be permanently lost.</p>
        <p className="text-gray-700 mt-2">Please type **"delete my account"** to confirm.</p>
        <input type="text" className="w-full p-2 border border-gray-300 rounded mt-4 text-gray-900" />
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;