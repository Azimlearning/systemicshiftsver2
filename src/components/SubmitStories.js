// src/components/SubmitStories.js
'use client';

import { useState } from 'react';

// ... (Components are unchanged)
function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-lg font-semibold text-gray-700 mb-2">
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-gray-900"
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      rows="5"
      className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-gray-900"
    />
  );
}

function Checkbox({ name, value, label, onChange, checked, 'data-group': dataGroup }) {
  return (
    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md border border-gray-200">
      <input
        type="checkbox"
        name={name}
        value={value}
        onChange={onChange}
        checked={checked}
        data-group={dataGroup}
        className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}

function Radio({ name, value, label, onChange, checked }) {
  return (
    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md border border-gray-200">
      <input
        type="radio"
        name={name}
        value={value}
        onChange={onChange}
        checked={checked}
        className="h-5 w-5 text-teal-600 border-gray-300 focus:ring-teal-500"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}

const initialFormState = {
  fullName: '',
  division: '',
  department: '',
  alignsWithShifts: null,
  storyTitle: '',
  keyShifts: [],
  focusAreas: [],
  caseForChange: '',
  desiredEndState: '',
  desiredMindset: [],
  mindsetExplanation: '',
  nonShiftTitle: '',
  nonShiftDescription: '',
  acknowledgement: false,
};

export default function SubmitStories() {
  const [formData, setFormData] = useState(initialFormState);
  const [writeUpFile, setWriteUpFile] = useState(null);
  const [visualFiles, setVisualFiles] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      if (name === 'writeUp') {
        setWriteUpFile(files[0] || null);
      } else if (name === 'visuals') {
        setVisualFiles(Array.from(files));
      }
    } else if (type === 'checkbox' && e.target.dataset.group) { // <-- BUG FIX HERE
      const groupName = e.target.dataset.group;
      setFormData((prev) => ({
        ...prev,
        [groupName]: checked
          ? [...(prev[groupName] || []), value] // Ensure iterable
          : (prev[groupName] || []).filter((item) => item !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const functionUrl = "https://submitstory-el2jwxb5bq-uc.a.run.app";

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => data.append(`${key}[]`, item));
      } else if (value !== null) {
        data.append(key, value);
      }
    });

    if (writeUpFile) {
      data.append('writeUp', writeUpFile, writeUpFile.name);
    }
    visualFiles.forEach((file) => {
      data.append('visuals', file, file.name);
    });

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      setFormData(initialFormState);
      setWriteUpFile(null);
      setVisualFiles([]);
      e.target.reset();
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);

    } catch (error) {
      console.error("Error submitting form via function: ", error);
      setSubmitError(`Submission failed: ${error.message}`);
    }

    setIsSubmitting(false);
  };

  const divisions = [
    'Malaysia Petroleum Management', 'Exploration', 'Development', 'Malaysia Assets',
    'International Assets', 'Strategy & Commercial', 'Finance & Risk',
    'Health, Safety & Environment', 'Carbon Management', 'Upstream Legal',
    'Global HR Partners Upstream', 'Other',
  ];

  return (
    <section id="submit-stories" className="bg-white py-16 md:py-24 relative">
      {showSuccessPopup && (
        <div className="popup-animation fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-80 text-white text-2xl font-bold px-10 py-6 rounded-lg shadow-xl z-50">
          Submitted!
        </div>
      )}

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Stories That Shift Us Forward</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're looking for Systemic Shifts stories...
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-10">
          <fieldset className="bg-gray-50 p-8 rounded-lg shadow-md">
            <legend className="text-3xl font-bold text-teal-700 mb-6">Your Details</legend>
            <div className="space-y-6">
              <div>
                <Label htmlFor="fullName">1. What is your full name? *</Label>
                <Input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required />
              </div>
              <div>
                <Label>2. Which Upstream division are you from? *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {divisions.map((div) => (
                    <Radio key={div} name="division" value={div} label={div} checked={formData.division === div} onChange={handleChange} required />
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="department">3. Please state your department. *</Label>
                <Input type="text" name="department" id="department" value={formData.department} onChange={handleChange} required />
              </div>
            </div>
          </fieldset>

          <fieldset className="bg-gray-50 p-8 rounded-lg shadow-md">
            <legend className="text-3xl font-bold text-teal-700 mb-6">Now tell us all about it!</legend>
            <div className="space-y-6">
              <Label>4. Does this story align with the goals of Systemic Shifts? *</Label>
              <div className="flex gap-4">
                <Radio name="alignsWithShifts" value="yes" label="Yes" checked={formData.alignsWithShifts === 'yes'} onChange={handleChange} required />
                <Radio name="alignsWithShifts" value="no" label="No" checked={formData.alignsWithShifts === 'no'} onChange={handleChange} />
              </div>
            </div>
          </fieldset>

          {formData.alignsWithShifts === 'yes' && (
            <fieldset className="bg-teal-50 p-8 rounded-lg shadow-md space-y-8 animate-fade-in">
               <div>
                <Label htmlFor="storyTitle">5. What is the title of your Systemic Shifts story? *</Label>
                <Input type="text" name="storyTitle" id="storyTitle" value={formData.storyTitle} onChange={handleChange} required />
              </div>
              <div>
                <Label>6. Which key Shifts does your story support? *</Label>
                <div className="flex flex-col gap-4">
                  <Checkbox data-group="keyShifts" value="Portfolio High-Grading" label="Portfolio High-Grading" checked={formData.keyShifts.includes('Portfolio High-Grading')} onChange={handleChange} />
                  <Checkbox data-group="keyShifts" value="Deliver Advantaged Barrels" label="Deliver Advantaged Barrels" checked={formData.keyShifts.includes('Deliver Advantaged Barrels')} onChange={handleChange} />
                </div>
              </div>
              {formData.keyShifts.includes('Deliver Advantaged Barrels') && (
                <div className="pl-6 border-l-4 border-teal-500 space-y-4 animate-fade-in">
                  <Label>7. Which focus area(s) under Deliver Advantaged Barrels does your initiative align with? *</Label>
                  <Checkbox data-group="focusAreas" value="More Risk Tolerant" label="More Risk Tolerant" checked={formData.focusAreas.includes('More Risk Tolerant')} onChange={handleChange} />
                  <Checkbox data-group="focusAreas" value="Improve Cost and Operational Efficiency" label="Improve Cost and Operational Efficiency" checked={formData.focusAreas.includes('Improve Cost and Operational Efficiency')} onChange={handleChange} />
                  <Checkbox data-group="focusAreas" value="Pursue Partnership for Growth & Innovative Solutions" label="Pursue Partnership for Growth & Innovative Solutions" checked={formData.focusAreas.includes('Pursue Partnership for Growth & Innovative Solutions')} onChange={handleChange} />
                </div>
              )}
              <div>
                <Label htmlFor="caseForChange">8. What is your case for change? *</Label>
                <Textarea name="caseForChange" id="caseForChange" value={formData.caseForChange} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="desiredEndState">9. What is the desired end state you are expecting? *</Label>
                <Textarea name="desiredEndState" id="desiredEndState" value={formData.desiredEndState} onChange={handleChange} required />
              </div>
              <div>
                <Label>10. Which elements of the Desired Mindset are being cultivated? *</Label>
                <div className="flex flex-col gap-4">
                  <Checkbox data-group="desiredMindset" value="More Risk Tolerant" label="More Risk Tolerant" checked={formData.desiredMindset.includes('More Risk Tolerant')} onChange={handleChange} />
                  <Checkbox data-group="desiredMindset" value="Commercial Savvy" label="Commercial Savvy" checked={formData.desiredMindset.includes('Commercial Savvy')} onChange={handleChange} />
                  <Checkbox data-group="desiredMindset" value="Growth Mindset" label="Growth Mindset" checked={formData.desiredMindset.includes('Growth Mindset')} onChange={handleChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="mindsetExplanation">11. Please briefly explain how this initiative supports the desired mindset.</Label>
                <Textarea name="mindsetExplanation" id="mindsetExplanation" value={formData.mindsetExplanation} onChange={handleChange} />
              </div>
            </fieldset>
          )}

          {formData.alignsWithShifts === 'no' && (
            <fieldset className="bg-gray-100 p-8 rounded-lg shadow-md space-y-8 animate-fade-in">
              <legend className="text-2xl font-bold text-gray-700 mb-4">Non Systemic Shifts Stories</legend>
              <div>
                <Label htmlFor="nonShiftTitle">12. What is the title of your story? *</Label>
                <Input type="text" name="nonShiftTitle" id="nonShiftTitle" value={formData.nonShiftTitle} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="nonShiftDescription">13. Please provide a brief description of your story. *</Label>
                <Textarea name="nonShiftDescription" id="nonShiftDescription" value={formData.nonShiftDescription} onChange={handleChange} required />
              </div>
            </fieldset>
          )}

          <fieldset className="bg-gray-50 p-8 rounded-lg shadow-md">
            <legend className="text-3xl font-bold text-teal-700 mb-6">Documentation and Media</legend>
             <div className="space-y-6">
              <div>
                <Label htmlFor="writeUp">14. Please upload a detailed write-up of your initiative.</Label>
                <Input type="file" name="writeUp" id="writeUp" onChange={handleChange} />
                <p className="text-sm text-gray-500 mt-2">Allowed types: Word, Excel, PPT, PDF, Image, Video (Max 1GB)</p>
              </div>
              <div>
                <Label htmlFor="visuals">15. Upload any visuals (posters, charts, photos, or videos).</Label>
                <Input type="file" name="visuals" id="visuals" multiple onChange={handleChange} />
                <p className="text-sm text-gray-500 mt-2">You can upload multiple files (Max 1GB each)</p>
              </div>
            </div>
          </fieldset>
          
          <fieldset className="bg-gray-50 p-8 rounded-lg shadow-md">
            <legend className="text-3xl font-bold text-teal-700 mb-6">Acknowledgement and Consent</legend>
            <div className="space-y-6">
              <label className="flex items-start space-x-3 p-3">
                <input
                  type="checkbox"
                  name="acknowledgement"
                  checked={formData.acknowledgement}
                  onChange={handleChange}
                  required
                  className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-1"
                />
                <span className="text-gray-700">
                  I hereby acknowledge and provide my full consent...
                </span>
              </label>
            </div>
          </fieldset>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-8 bg-teal-600 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Your Story'}
            </button>
            
            {submitError && (
              <p className="text-red-600 font-semibold text-center mt-4">
                {submitError}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
