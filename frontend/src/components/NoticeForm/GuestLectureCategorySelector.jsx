import React, { useState } from 'react';
import GuestLectureNotice from './GuestLectureNotice';

const GuestLectureCategorySelector = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showForm, setShowForm] = useState(false);

  const guestLectureCategories = [
    {
      value: 'dept',
      label: 'Guest Lecture by Dept',
      icon: '🏛️',
      description: 'Organized by individual departments for their students',
      color: 'from-blue-600 to-blue-700'
    },
    {
      value: 'committee',
      label: 'Guest Lecture by Committee',
      icon: '👥',
      description: 'Organized by college committees for all students',
      color: 'from-purple-600 to-purple-700'
    }
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowForm(true);
  };

  const handleBack = () => {
    setSelectedCategory('');
    setShowForm(false);
  };

  if (showForm && selectedCategory) {
    return (
      <div>
        <button
          onClick={handleBack}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Categories
        </button>
        <GuestLectureNotice category={selectedCategory} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Guest Lecture Type</h3>
        <p className="text-gray-600">Choose the organizing body for this guest lecture</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guestLectureCategories.map((category) => (
          <div
            key={category.value}
            onClick={() => handleCategorySelect(category.value)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 flex"
          >
            <div className={`bg-gradient-to-br ${category.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between w-full`}>
              <div className="text-center space-y-4 flex-grow">
                <div className="text-5xl mb-4">{category.icon}</div>
                <h4 className="text-xl font-bold">{category.label}</h4>
                <p className="text-white/90 text-sm leading-relaxed">{category.description}</p>
              </div>
                
              <div className="mt-6">
                <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold hover:bg-white/30 transition-colors duration-200">
                  Select This Type
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
        <div className="flex items-center">
          <span className="text-2xl mr-3">💡</span>
          <div>
            <h4 className="font-semibold text-blue-800">Need Help Choosing?</h4>
            <p className="text-sm text-blue-600 mt-1">
              <strong>Department:</strong> For lectures organized by specific departments (e.g., BBA Dept, BBA-IB Dept)<br/>
              <strong>Committee:</strong> For lectures organized by college-wide committees (e.g., Finance Committee, Green Club Committee)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestLectureCategorySelector;
