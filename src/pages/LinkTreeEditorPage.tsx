import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LinkTreeEditor } from '../components/LinkTreeEditor';

export const LinkTreeEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const targetId = id?.trim() || '';

  if (!targetId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">ID tidak ditemukan di URL.</p>
      </div>
    );
  }

  return (
    <LinkTreeEditor
      id={targetId}
      onGoBack={() => navigate(`/${targetId}`)}
    />
  );
};
