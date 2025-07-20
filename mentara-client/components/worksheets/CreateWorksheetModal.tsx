import { X, Upload } from "lucide-react";

interface CreateWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateWorksheetModal({
  isOpen,
  onClose,
}: CreateWorksheetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[98vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Create New Worksheet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none p-1"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <form>
            <div className="space-y-6">
              {/* Worksheet Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Worksheet Title *
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:border-transparent"
                  placeholder="Enter worksheet title"
                />
              </div>

              {/* Patient Selection */}
              <div>
                <label
                  htmlFor="patient"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Assign to Patient *
                </label>
                <select
                  id="patient"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:border-transparent"
                >
                  <option value="">Select a patient</option>
                  <option value="1">John Doe</option>
                  <option value="2">Sarah Williams</option>
                  <option value="3">Mike Chen</option>
                  <option value="4">Emma Johnson</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Due Date *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:border-transparent"
                />
              </div>

              {/* Instructions */}
              <div>
                <label
                  htmlFor="instructions"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Instructions
                </label>
                <textarea
                  id="instructions"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:border-transparent"
                  placeholder="Provide instructions for the patient..."
                ></textarea>
              </div>

              {/* Reference Materials */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Materials
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 sm:p-6 flex flex-col items-center">
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-2" />
                  <p className="text-xs sm:text-sm text-gray-500 mb-1 text-center">
                    Drag and drop files here, or click to select files
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    PDF, DOC, DOCX, JPG, PNG (max 10MB)
                  </p>
                  <button
                    type="button"
                    className="mt-3 sm:mt-4 px-3 py-2 sm:px-4 sm:py-2 bg-[#129316]/15 text-[#436B00] rounded-md hover:bg-[#129316]/20 focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:ring-offset-2 text-sm"
                  >
                    Select Files
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="order-2 sm:order-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                className="order-1 sm:order-2 px-4 py-2 bg-[#436B00] text-white rounded-md hover:bg-[#129316] focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:ring-offset-2"
              >
                Create Worksheet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
