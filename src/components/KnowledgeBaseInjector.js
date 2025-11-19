// src/components/KnowledgeBaseInjector.js
'use client';

import { useState } from 'react';
import { FaTimes, FaCheck, FaSpinner, FaFileUpload, FaFile } from 'react-icons/fa';

const CATEGORIES = [
  'systemic-shifts',
  'mindset-behaviour',
  'upstream-target',
  'petronas-info',
  'upstream',
  'articles',
  'general'
];

export default function KnowledgeBaseInjector({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
    source: 'manual',
    sourceUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const injectFunctionUrl = "https://us-central1-systemicshiftv2.cloudfunctions.net/injectKnowledgeBase";
  const uploadAndInjectFunctionUrl = "https://us-central1-systemicshiftv2.cloudfunctions.net/uploadKnowledgeBase";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title from filename if title is empty
      if (!formData.title.trim()) {
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({
          ...prev,
          title: fileNameWithoutExt
        }));
      }
    }
  };

  const handleExtractAndFill = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }

    setIsExtracting(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('source', formData.source || 'document');
      formDataToSend.append('sourceUrl', formData.sourceUrl);

      const response = await fetch(uploadAndInjectFunctionUrl, {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      // Auto-fill form with extracted content
      setFormData(prev => ({
        ...prev,
        title: prev.title || data.title || selectedFile.name.replace(/\.[^/.]+$/, ''),
        content: data.extractedText || prev.content,
        tags: data.suggestedTags ? data.suggestedTags.join(', ') : prev.tags,
        category: data.suggestedCategory || prev.category
      }));

      setMessage({ 
        type: 'success', 
        text: `Text extracted from ${selectedFile.name}. Review and edit the content, then click "Add to Knowledge Base".` 
      });

    } catch (error) {
      console.error('[Knowledge Base Injector] Extraction error:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to extract text: ${error.message}` 
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setMessage({ type: 'error', text: 'Title and Content are required' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Parse tags from comma-separated string
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: tagsArray,
        source: formData.source,
        sourceUrl: formData.sourceUrl.trim() || '',
      };

      const response = await fetch(injectFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      setMessage({ 
        type: 'success', 
        text: `Successfully added "${formData.title}" to knowledge base!` 
      });

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          title: '',
          content: '',
          category: 'general',
          tags: '',
          source: 'manual',
          sourceUrl: '',
        });
        setSelectedFile(null);
        setMessage({ type: '', text: '' });
        onClose();
      }, 2000);

    } catch (error) {
      console.error('[Knowledge Base Injector] Error:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to add content: ${error.message}` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadAndAddDirectly = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('source', formData.source || 'document');
      formDataToSend.append('sourceUrl', formData.sourceUrl);
      formDataToSend.append('title', formData.title || selectedFile.name.replace(/\.[^/.]+$/, ''));
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('addDirectly', 'true'); // Flag to add directly

      const response = await fetch(uploadAndInjectFunctionUrl, {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      setMessage({ 
        type: 'success', 
        text: `Successfully uploaded and added "${data.title || selectedFile.name}" to knowledge base!` 
      });

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          title: '',
          content: '',
          category: 'general',
          tags: '',
          source: 'manual',
          sourceUrl: '',
        });
        setSelectedFile(null);
        setMessage({ type: '', text: '' });
        onClose();
      }, 2000);

    } catch (error) {
      console.error('[Knowledge Base Injector] Upload and add error:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to upload and add: ${error.message}` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Add to Knowledge Base</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* File Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload Document (PDF, DOCX, TXT)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.doc"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting || isExtracting}
                  />
                  <div className="flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <FaFileUpload className="text-teal-600" size={20} />
                    <span className="text-sm text-gray-700">
                      {selectedFile ? selectedFile.name : 'Choose a file...'}
                    </span>
                  </div>
                </label>
                {selectedFile && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleExtractAndFill}
                      disabled={isExtracting || isSubmitting}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isExtracting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <FaFile />
                          Extract Text
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleUploadAndAddDirectly}
                      disabled={isExtracting || isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      title="Upload, extract, and add directly to knowledge base"
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          Upload & Add
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              {selectedFile && (
                <p className="text-xs text-gray-500 mt-2">
                  File: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., PETRONAS Company Overview"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                placeholder="Enter the content to add to the knowledge base..."
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Category and Source */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  disabled={isSubmitting}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Source
                </label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="manual, website, document, etc."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Tags and Source URL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="petronas, upstream, strategy, etc."
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Source URL (optional)
                </label>
                <input
                  type="text"
                  name="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="/petronas-2.0 or external URL"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <FaCheck />
                Add to Knowledge Base
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

