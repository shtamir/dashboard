// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FamilyPortal from '@components/FamilyPortal';
import LinkDevice from '@components/LinkDevice'; // (we'll create this next)

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<FamilyPortal />} />
      <Route path="/link" element={<LinkDevice />} />
    </Routes>
  </BrowserRouter>
);

export default App;