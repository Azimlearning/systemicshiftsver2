// src/components/MeetX/MeetingEditor.js
'use client';

import { useState, useRef } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import FileUploader from './FileUploader';
import { FaSave, FaTimes, FaFileUpload } from 'react-icons/fa';

export default function MeetingEditor({ meeting, onSave, onCancel }) {
  const [title, setTitle] = useState(meeting?.title || '');
  const [content, setContent] = useState(meeting?.content || '');
  const [isPublic, setIsPublic] = useState(meeting?.isPublic || false);
  const [sharedWith, setSharedWith] = useState(meeting?.sharedWith || []);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState(meeting?.fileUrl || '');
  const [fileName, setFileName] = useState(meeting?.fileName || '');
  const [fileType, setFileType] = useState(meeting?.fileType || 'manual');
  const [processingFile, setProcessingFile] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setProcessingFile(true);

    try {
      const fileExt = file.name.split('.').pop().toLowerCase();
      const allowedExt = ['pdf', 'txt', 'docx'];
      
      if (!allowedExt.includes(fileExt)) {
        alert('Only PDF, TXT, and DOCX files are supported');
        setUploading(false);
        setProcessingFile(false);
        return;
      }

      // Upload to Firebase Storage
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'meeting';
      const filename = `${Date.now()}_${sanitizedTitle}.${fileExt}`;
      const storagePath = `meetxFiles/${filename}`;
      const storageRef = ref(storage, storagePath);

      setUploadProgress(30);
      await uploadBytes(storageRef, file);
      setUploadProgress(60);
      const downloadURL = await getDownloadURL(storageRef);
      setUploadProgress(80);

      setFileUrl(downloadURL);
      setFileName(file.name);
      setFileType(fileExt);

      // Process file to extract text
      setUploadProgress(90);
      try {
        const functionUrl = process.env.NEXT_PUBLIC_PROCESS_MEETING_FILE_URL || 'https://us-central1-systemicshiftv2.cloudfunctions.net/processMeetingFile';
        const processResponse = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileUrl: downloadURL,
            fileName: file.name,
            fileType: fileExt
          })
        });

        if (processResponse.ok) {
          const processData = await processResponse.json();
          if (processData.extractedText) {
            setContent(processData.extractedText);
          }
        } else {
          console.warn('File processing function not available, using file as-is');
          // Continue without extracted text - user can manually enter
        }
      } catch (error) {
        console.warn('File processing failed:', error);
        // Continue without extracted text - user can manually enter
      }

      setUploadProgress(100);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setProcessingFile(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a meeting title');
      return;
    }

    if (!content.trim() && !fileUrl) {
      alert('Please enter meeting content or upload a file');
      return;
    }

    try {
      const userId = 'admin'; // For now, using simple user ID
      const meetingData = {
        title: title.trim(),
        content: content.trim() || 'No content provided',
        isPublic,
        sharedWith,
        createdBy: userId,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileType: fileType || 'manual',
        updatedAt: serverTimestamp(),
      };

      let meetingId = meeting?.id;
      
      if (meeting) {
        // Update existing meeting
        await updateDoc(doc(db, 'meetings', meeting.id), meetingData);
        meetingId = meeting.id;
      } else {
        // Create new meeting
        meetingData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'meetings'), meetingData);
        meetingId = docRef.id;
      }

      // Trigger AI processing (async, don't wait)
      if (meetingId && (!meeting || content !== meeting.content)) {
        const functionUrl = process.env.NEXT_PUBLIC_GENERATE_MEETING_INSIGHTS_URL || 'https://us-central1-systemicshiftv2.cloudfunctions.net/generateMeetingInsights';
        fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId: meetingId,
            content: content.trim() || 'No content provided',
            title: title.trim()
          })
        }).catch(err => {
          console.warn('AI processing not available yet:', err);
          // This is non-critical - insights will be generated when function is deployed
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert('Failed to save meeting. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {meeting ? 'Edit Meeting' : 'Create New Meeting'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaTimes />
        </button>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Enter meeting title..."
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Meeting Notes (PDF, TXT, DOCX)
          </label>
          <FileUploader
            onFileSelect={handleFileUpload}
            uploading={uploading}
            uploadProgress={uploadProgress}
            currentFile={fileName}
          />
          {fileUrl && (
            <p className="mt-2 text-sm text-teal-600">
              File uploaded: {fileName}
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Enter meeting notes or upload a file to extract text..."
          />
        </div>

        {/* Sharing Options */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sharing Options</h3>
          
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Make this meeting public (visible to all users)</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share with specific users (comma-separated user IDs)
            </label>
            <input
              type="text"
              value={sharedWith.join(', ')}
              onChange={(e) => setSharedWith(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="user1, user2, user3"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={uploading || processingFile}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave /> Save Meeting
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

