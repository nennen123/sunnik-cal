// app/calculator/components/Remarks.jsx
'use client';

import { useState } from 'react';

export default function Remarks({ value = '', onChange }) {
  const [charCount, setCharCount] = useState(value.length);
  const maxChars = 500;

  const handleChange = (e) => {
    const newValue = e.target.value;
    setCharCount(newValue.length);
    onChange(newValue);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      {/* Section Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-purple-800 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800">
          📝 Remarks
        </h2>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <label htmlFor="remarks" className="block text-sm font-semibold text-gray-700">
          Additional Notes or Special Requirements
        </label>
        <textarea
          id="remarks"
          value={value}
          onChange={handleChange}
          maxLength={maxChars}
          rows={5}
          placeholder="Enter any special requirements, custom specifications, or additional notes here..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                   focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                   transition-all duration-200 resize-none
                   text-gray-800 placeholder-gray-400"
        />

        {/* Character Counter */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            💡 <em>These remarks will appear in the final quotation</em>
          </span>
          <span className={`font-semibold ${
            charCount > maxChars * 0.9 ? 'text-orange-600' : 'text-gray-600'
          }`}>
            {charCount} / {maxChars} characters
          </span>
        </div>
      </div>

      {/* Info Box */}
      {value.trim().length > 0 && (
        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ <strong>Remarks added:</strong> Your notes will be included in the quote
          </p>
        </div>
      )}
    </div>
  );
}
