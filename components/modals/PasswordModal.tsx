// components/modals/PasswordModal.tsx

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordModal = ({ isOpen, onClose }: PasswordModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Current Password</label>
            <input type="password" className="w-full p-2 border rounded mt-1 text-gray-900" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">New Password</label>
            <input type="password" className="w-full p-2 border rounded mt-1 text-gray-900" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Confirm New Password</label>
            <input type="password" className="w-full p-2 border rounded mt-1 text-gray-900" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Update Password</button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;