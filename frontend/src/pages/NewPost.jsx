import React from 'react';
import { Link } from 'react-router-dom';

const NewPost = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="text-gray-600">Share your thoughts with the community</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">Post creation coming soon!</p>
          <Link to="/community" className="text-amber-600 hover:text-amber-700">Back to Community</Link>
        </div>
      </div>
    </div>
  );
};

export default NewPost; 
