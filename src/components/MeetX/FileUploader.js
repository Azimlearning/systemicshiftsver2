// src/components/MeetX/FileUploader.js
'use client';

import { useRef } from 'react';
import { FaUpload, FaFileAlt } from 'react-icons/fa';

export default function FileUploader({ onFileSelect, uploading, uploadProgress, currentFile }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <div className="space-y-2">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : currentFile ? (
          <div className="flex items-center justify-center gap-2 text-teal-600">
            <FaFileAlt />
            <span className="text-sm">{currentFile}</span>
          </div>
        ) : (
          <div className="space-y-2">
            <FaUpload className="mx-auto text-3xl text-gray-400" />
            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500">PDF, TXT, or DOCX (Max 10MB)</p>
          </div>
        )}
      </div>
    </div>
  );
}

