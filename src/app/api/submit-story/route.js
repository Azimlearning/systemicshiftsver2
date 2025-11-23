// src/app/api/submit-story/route.js
import { NextResponse } from 'next/server';
import { db, storage } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const submissionData = {
      name: formData.get('name') || '',
      department: formData.get('department') || '',
      storyTitle: formData.get('storyTitle') || '',
      story: formData.get('story') || '',
      nonShiftTitle: formData.get('nonShiftTitle') || '',
      alignsWithShifts: formData.get('alignsWithShifts') === 'null' ? null : formData.get('alignsWithShifts') || '',
      keyShifts: formData.getAll('keyShifts[]') || [],
      focusAreas: formData.getAll('focusAreas[]') || [],
      desiredMindset: formData.getAll('desiredMindset[]') || [],
      acknowledgement: formData.get('acknowledgement') === 'true',
      submittedAt: serverTimestamp(),
      writeUpURL: '',
      visualURLs: [],
    };

    // Handle write-up file upload
    const writeUpFile = formData.get('writeUp');
    if (writeUpFile && writeUpFile.size > 0) {
      try {
        const uniqueFilename = `${Date.now()}_${writeUpFile.name}`;
        const storageRef = ref(storage, `writeUps/${uniqueFilename}`);
        const fileBuffer = await writeUpFile.arrayBuffer();
        await uploadBytes(storageRef, fileBuffer, {
          contentType: writeUpFile.type,
        });
        const downloadURL = await getDownloadURL(storageRef);
        submissionData.writeUpURL = downloadURL;
      } catch (error) {
        console.error('Error uploading write-up:', error);
        // Continue without write-up URL
      }
    }

    // Handle visual files upload
    const visualFiles = formData.getAll('visuals');
    const uploadedVisualURLs = [];
    for (const visualFile of visualFiles) {
      if (visualFile && visualFile.size > 0) {
        try {
          const uniqueFilename = `${Date.now()}_${visualFile.name}`;
          const storageRef = ref(storage, `visuals/${uniqueFilename}`);
          const fileBuffer = await visualFile.arrayBuffer();
          await uploadBytes(storageRef, fileBuffer, {
            contentType: visualFile.type,
          });
          const downloadURL = await getDownloadURL(storageRef);
          uploadedVisualURLs.push(downloadURL);
        } catch (error) {
          console.error('Error uploading visual:', error);
          // Continue with other visuals
        }
      }
    }
    submissionData.visualURLs = uploadedVisualURLs;

    // Ensure arrays are not empty (set to empty array if needed)
    if (!submissionData.keyShifts || submissionData.keyShifts.length === 0) {
      submissionData.keyShifts = [];
    }
    if (!submissionData.focusAreas || submissionData.focusAreas.length === 0) {
      submissionData.focusAreas = [];
    }
    if (!submissionData.desiredMindset || submissionData.desiredMindset.length === 0) {
      submissionData.desiredMindset = [];
    }

    // Set initial image URL for local generator to detect
    submissionData.aiGeneratedImageUrl = 'Pending local generation';

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'stories'), submissionData);

    return NextResponse.json({
      message: 'Story submitted successfully!',
      storyId: docRef.id,
    }, { status: 200 });

  } catch (error) {
    console.error('Error submitting story:', error);
    return NextResponse.json(
      { error: `Failed to process submission: ${error.message}` },
      { status: 500 }
    );
  }
}

