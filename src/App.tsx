import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { RedirectPage } from './pages/RedirectPage';

/**
 * Root query parameter fallback handler:
 * If someone accesses root with query param (e.g. /?id=001 or /?qr=001),
 * redirect cleanly to the dedicated /:id route (/001).
 * Otherwise, render DashboardPage.
 */
const RootQueryRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id') || searchParams.get('qr');

  if (queryId && queryId.trim()) {
    return <Navigate to={`/${queryId.trim()}`} replace />;
  }

  // Handle hash fallback if someone accesses e.g. /#/menu or /#menu
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (hash && hash !== 'admin' && hash !== '') {
    return <Navigate to={`/${hash}`} replace />;
  }

  return <DashboardPage />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Dashboard / Home */}
        <Route path="/" element={<RootQueryRedirect />} />

        {/* Explicit Admin Route */}
        <Route path="/admin" element={<DashboardPage />} />

        {/* Dynamic Redirect Handler Route (e.g. /001, /qr001, /menu) */}
        <Route path="/:id" element={<RedirectPage />} />

        {/* Catch-all fallback redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
