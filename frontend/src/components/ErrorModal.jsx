import React from 'react';
import Modal from 'react-modal';

// Set the root element for accessibility
Modal.setAppElement('#root');

/**
 * ErrorModal Component
 * Displays a list of validation errors in a modal.
 */
const ErrorModal = ({ isOpen, errors, onClose }) => (
  <Modal
    isOpen={isOpen} // Controls visibility of the modal
    onRequestClose={onClose} // Function to close the modal
    className="bg-white rounded-lg p-6 max-w-2xl mx-auto mt-20 shadow-xl"
    overlayClassName="fixed inset-0 bg-black bg-opacity-50"
  >
    <h2 className="text-2xl font-bold text-red-600 mb-4">Validation Errors</h2>

    {/* List of errors */}
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {errors.map((error, i) => (
        <div key={i} className="p-3 bg-red-50 rounded-lg">
          <p className="font-medium">Sheet: <span className="text-gray-700">{error.sheet}</span></p>
          <p className="font-medium">Row {error.row}: <span className="text-red-500">{error.message}</span></p>
        </div>
      ))}
    </div>

    {/* Close button */}
    <button
      onClick={onClose}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Close
    </button>
  </Modal>
);

export default ErrorModal;
