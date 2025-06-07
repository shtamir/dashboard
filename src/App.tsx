// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FamilyPortal from '@components/FamilyPortal';
import LinkDevice from '@components/LinkDevice'; // (we'll create this next)
import PrivacyPolicy from '@components/PrivacyPolicy';
import TermsOfService from '@components/TermsOfService';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<FamilyPortal />} />
      <Route path="link" element={<LinkDevice />} />
      <Route path="privacy" element={<PrivacyPolicy />} />
      <Route path="terms" element={<TermsOfService />} />
    </Routes>
  </BrowserRouter>
);

export default App;