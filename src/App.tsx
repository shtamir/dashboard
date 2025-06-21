// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import FamilyPortal from '@components/FamilyPortal';
import LinkDevice from '@components/LinkDevice'; // (we'll create this next)
import PrivacyPolicy from '@components/PrivacyPolicy';
import TermsOfService from '@components/TermsOfService';
import BackgroundVideo from '@components/BackgroundVideo';

const AppContent = () => {
  const location = useLocation();
  const showBackground = !location.pathname.startsWith('/link');
  return (
    <>
      {showBackground && <BackgroundVideo />}
      <Routes>
        <Route path="/" element={<FamilyPortal />} />
        <Route path="link" element={<LinkDevice />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsOfService />} />
      </Routes>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;