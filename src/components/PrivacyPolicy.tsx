import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Privacy Policy</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-gray-600 mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Google Calendar data (read-only access)</li>
            <li>Google Sheets data (read and write access)</li>
            <li>Google Photos data (read-only access)</li>
            <li>Device linking information</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Display your calendar events on your TV</li>
            <li>Show and manage your family photos</li>
            <li>Display and update your family's to-do lists</li>
            <li>Link your devices for seamless access</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. Data Storage and Security</h2>
          <p className="text-gray-600 mb-4">
            We store your data securely using Google's infrastructure. We implement appropriate security measures to protect your personal information.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Your Rights</h2>
          <p className="text-gray-600 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Access your personal data</li>
            <li>Request deletion of your data</li>
            <li>Revoke access to your Google account</li>
            <li>Export your data</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            <a href="mailto:support@family-dash.netlify.app" className="text-blue-600 hover:text-blue-800">
              support@family-dash.netlify.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 