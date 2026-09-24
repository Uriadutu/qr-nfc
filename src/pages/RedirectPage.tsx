import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RedirectHandler } from '../components/RedirectHandler';

export const RedirectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Extract ID from param or query fallback
  const targetId = id?.trim() || new URLSearchParams(window.location.search).get('id') || '';

  return (
    <RedirectHandler
      id={targetId}
      isAdmin={true}
      onGoHome={() => navigate('/')}
    />
  );
};
