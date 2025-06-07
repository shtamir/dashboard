import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Terms of Service</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 mb-4">
            By accessing and using the Family TV Dashboard, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. Description of Service</h2>
          <p className="text-gray-600 mb-4">
            The Family TV Dashboard is a service that allows you to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Display calendar events on your TV</li>
            <li>Share and view family photos</li>
            <li>Manage family to-do lists</li>
            <li>Link multiple devices for seamless access</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. User Responsibilities</h2>
          <p className="text-gray-600 mb-4">
            You agree to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Provide accurate information when linking devices</li>
            <li>Maintain the security of your account</li>
            <li>Not share your access credentials</li>
            <li>Use the service in compliance with all applicable laws</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Service Limitations</h2>
          <p className="text-gray-600 mb-4">
            We reserve the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Modify or discontinue the service at any time</li>
            <li>Limit access to certain features</li>
            <li>Update these terms as needed</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Disclaimer of Warranties</h2>
          <p className="text-gray-600 mb-4">
            The service is provided "as is" without any warranties, express or implied. We do not guarantee that the service will be uninterrupted or error-free.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">6. Contact Information</h2>
          <p className="text-gray-600 mb-4">
            For questions about these Terms of Service, please contact us at:
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

export default TermsOfService; 