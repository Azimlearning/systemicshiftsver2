'use client'; // This component is highly interactive

import { useState } from 'react';

// Reusable component for styling form labels
function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-lg font-semibold text-gray-700 mb-2">
      {children}
    </label>
  );
}

// Reusable component for styling form inputs
function Input(props) {
  return (
    <input
      {...props}
      className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
    />
  );
}

// Reusable component for styling textareas
function Textarea(props) {
  return (
    <textarea
      {...props}
      rows="5"
      className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
    />
  );
}

// Reusable component for styling checkboxes
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

// Reusable component for styling radio buttons
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

export default function SubmitStories() {
  // State to manage all form data
  const [formData, setFormData] = useState({
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
  });

  // A single handler to update our form data state
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      const group = e.target.dataset.group;
      if (group) {
        // Handle checkbox groups (add/remove from array)
        setFormData((prev) => ({
          ...prev,
          [group]: checked
            ? [...prev[group], value] // Add to array
            : prev[group].filter((item) => item !== value), // Remove from array
        }));
      } else {
        // Handle single acknowledgement checkbox
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      // Handle all other inputs (text, radio)
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This is where we will eventually send the data to Firebase
    // and the AI analysis function
    console.log('Form Submitted:', formData);
    alert('Thank you for your submission!');
  };

  const divisions = [
    'Malaysia Petroleum Management', 'Exploration', 'Development', 'Malaysia Assets',
    'International Assets', 'Strategy & Commercial', 'Finance & Risk',
    'Health, Safety & Environment', 'Carbon Management', 'Upstream Legal',
    'Global HR Partners Upstream', 'Other',
  ];

  return (
    <section id="submit-stories" className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Form Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Stories That Shift Us Forward</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're looking for Systemic Shifts stories anchored on being a Pure Commercial Play, driven by two key shifts: Portfolio High-Grading and Deliver Advantaged Barrels. These stories will help showcase best practices and celebrate our collective achievements.
          </p>
        </div>

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Section 1: Your Details */}
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
                    <Radio
                      key={div} name="division" value={div} label={div}
                      checked={formData.division === div} onChange={handleChange}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="department">3. Please state your department. *</Label>
                <Input type="text" name="department" id="department" value={formData.department} onChange={handleChange} required />
              </div>
            </div>
          </fieldset>

          {/* Section 2: Story Details (Conditional) */}
          <fieldset className="bg-gray-50 p-8 rounded-lg shadow-md">
            <legend className="text-3xl font-bold text-teal-700 mb-6">Now tell us all about it!</legend>
            <div className="space-y-6">
              <Label>4. Does this story align with the goals of Systemic Shifts? *</Label>
              <div className="flex gap-4">
                <Radio name="alignsWithShifts" value="yes" label="Yes" checked={formData.alignsWithShifts === 'yes'} onChange={handleChange} />
                <Radio name="alignsWithShifts" value="no" label="No" checked={formData.alignsWithShifts === 'no'} onChange={handleChange} />
              </div>
            </div>
          </fieldset>

          {/* --- IF YES to Q4 --- */}
          {formData.alignsWithShifts === 'yes' && (
            <fieldset className="bg-teal-50 p-8 rounded-lg shadow-md space-y-8 animate-fade-in">
              <div>
                <Label htmlFor="storyTitle">5. What is the title of your Systemic Shifts story? *</Label>
                <Input type="text" name="storyTitle" id="storyTitle" value={formData.storyTitle} onChange={handleChange} />
              </div>

              <div>
                <Label>6. Which key Shifts does your story support? *</Label>
                <div className="flex flex-col gap-4">
                  <Checkbox
                    data-group="keyShifts" value="Portfolio High-Grading" label="Portfolio High-Grading"
                    checked={formData.keyShifts.includes('Portfolio High-Grading')} onChange={handleChange}
                  />
                  <Checkbox
                    data-group="keyShifts" value="Deliver Advantaged Barrels" label="Deliver Advantaged Barrels"
                    checked={formData.keyShifts.includes('Deliver Advantaged Barrels')} onChange={handleChange}
                  />
                </div>
              </div>

              {/* --- IF "Deliver Advantaged Barrels" is checked --- */}
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
                <Textarea name="caseForChange" id="caseForChange" value={formData.caseForChange} onChange={handleChange} />
              </div>
              
              <div>
                <Label htmlFor="desiredEndState">9. What is the desired end state you are expecting? *</Label>
                <Textarea name="desiredEndState" id="desiredEndState" value={formData.desiredEndState} onChange={handleChange} />
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

          {/* --- IF NO to Q4 --- */}
          {formData.alignsWithShifts === 'no' && (
            <fieldset className="bg-gray-100 p-8 rounded-lg shadow-md space-y-8 animate-fade-in">
              <legend className="text-2xl font-bold text-gray-700 mb-4">Non Systemic Shifts Stories</legend>
              <div>
                <Label htmlFor="nonShiftTitle">12. What is the title of your story? *</Label>
                <Input type="text" name="nonShiftTitle" id="nonShiftTitle" value={formData.nonShiftTitle} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="nonShiftDescription">13. Please provide a brief description of your story. *</Label>
                <Textarea name="nonShiftDescription" id="nonShiftDescription" value={formData.nonShiftDescription} onChange={handleChange} />
              </div>
            </fieldset>
          )}

          {/* Section 3: File Uploads */}
          <fieldset className="bg-gray-50 p-8 rounded-lg shadow-md">
            <legend className="text-3xl font-bold text-teal-700 mb-6">Documentation and Media</legend>
            <div className="space-y-6">
              <div>
                <Label htmlFor="writeUp">14. Please upload a detailed write-up of your initiative.</Label>
                <Input type="file" name="writeUp" id="writeUp" />
                <p className="text-sm text-gray-500 mt-2">Allowed types: Word, Excel, PPT, PDF, Image, Video (Max 1GB)</p>
              </div>
              <div>
                <Label htmlFor="visuals">15. Upload any visuals (posters, charts, photos, or videos).</Label>
                <Input type="file" name="visuals" id="visuals" multiple />
                <p className="text-sm text-gray-500 mt-2">You can upload multiple files (Max 1GB each)</p>
              </div>
            </div>
          </fieldset>
          
          {/* Section 4: Acknowledgement */}
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
                  I hereby acknowledge and provide my full consent for the publishing team to review, edit, and enhance the design, layout, and overall presentation of the content I have submitted. I understand that any modifications will be made solely for the purpose of improving readability, visual appeal, and alignment with the organization's publishing standards, without altering the core message or intent of the material.
                </span>
              </label>
            </div>
          </fieldset>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full py-4 px-8 bg-teal-600 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-teal-700 transition-colors"
            >
              Submit Your Story
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}