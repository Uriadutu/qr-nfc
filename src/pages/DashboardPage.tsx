import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeItem } from '../types';
import { useQrCodes } from '../hooks/useQrCodes';
import {
  updateQrTargetUrl,
  deleteQrCode,
  deleteBatchQrCodes,
  bulkGenerateQrCodes,
  BulkGenerateParams,
} from '../services/qrService';
import {
  generatePrintableQrCard,
  generateQrDataUrl,
  triggerDownload,
  downloadBulkAsZip,
} from '../utils/qrHelper';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { NfcInfoBanner } from '../components/dashboard/NfcInfoBanner';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { Toolbar } from '../components/dashboard/Toolbar';
import { QrGrid } from '../components/dashboard/QrGrid';
import { BulkGenerateModal } from '../components/BulkGenerateModal';
import { CustomSlugModal } from '../components/CustomSlugModal';
import { EditLinkModal } from '../components/EditLinkModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { PinLockScreen } from '../components/PinLockScreen';
import { isDashboardAuthenticated, clearDashboardAuthentication } from '../services/pinService';
import confetti from 'canvas-confetti';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isDashboardAuthenticated());

  // Active base domain origin
  const activeBaseUrl = useMemo(() => {
    return window.location.origin.replace(/\/+$/, '');
  }, []);

  // Custom hook for Firestore real-time items & QR preview cache
  const {
    items,
    loading,
    error,
    retry,
    previews,
    stats,
    removePreview,
    removeBatchPreviews,
  } = useQrCodes(activeBaseUrl);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'empty'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCustomSlugOpen, setIsCustomSlugOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QRCodeItem | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
  const [isDeletingProcess, setIsDeletingProcess] = useState(false);

  // ZIP download progress
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number } | null>(null);

  // Filtered items computation
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        item.id.toLowerCase().includes(query) ||
        (item.customSlug && item.customSlug.toLowerCase().includes(query)) ||
        (item.label && item.label.toLowerCase().includes(query)) ||
        (item.targetUrl && item.targetUrl.toLowerCase().includes(query));

      if (!matchSearch) return false;

      if (statusFilter === 'active') {
        return Boolean(item.targetUrl && item.targetUrl.trim() !== '');
      }
      if (statusFilter === 'empty') {
        return !item.targetUrl || item.targetUrl.trim() === '';
      }
      return true;
    });
  }, [items, searchQuery, statusFilter]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  // Bulk Generate Action
  const handleBulkGenerate = async (params: BulkGenerateParams) => {
    setIsGenerating(true);
    try {
      await bulkGenerateQrCodes(params);
      setIsBulkOpen(false);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Error during bulk generation:', err);
      alert('Terjadi kesalahan saat generate massal ke Firestore.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Edit Link Action
  const handleSaveEdit = async (id: string, newUrl: string) => {
    setIsSavingEdit(true);
    try {
      await updateQrTargetUrl(id, newUrl);
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving link:', err);
      alert('Gagal menyimpan tautan ke Firestore.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Clear Link Action
  const handleClearLink = async (id: string) => {
    setIsSavingEdit(true);
    try {
      await updateQrTargetUrl(id, '');
      setEditingItem(null);
    } catch (err) {
      console.error('Error clearing link:', err);
      alert('Gagal mengosongkan link.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Action
  const requestDeleteSingle = (id: string) => {
    setItemToDelete(id);
    setIsDeletingModalOpen(true);
  };

  const confirmDeleteSingle = async () => {
    if (!itemToDelete) return;
    setIsDeletingProcess(true);
    try {
      await deleteQrCode(itemToDelete);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemToDelete);
        return next;
      });
      removePreview(itemToDelete);
      setIsDeletingModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting QR:', err);
      alert('Gagal menghapus item dari Firestore. Periksa koneksi.');
    } finally {
      setIsDeletingProcess(false);
    }
  };

  // Bulk Delete
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!confirm(`Hapus ${count} QR Code yang dipilih secara permanen dari Firestore?`)) return;

    try {
      const idsToDelete = Array.from(selectedIds);
      await deleteBatchQrCodes(idsToDelete);
      removeBatchPreviews(idsToDelete);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error bulk deleting:', err);
      alert('Gagal menghapus beberapa item.');
    }
  };

  // Download Single QR
  const handleDownloadSingle = async (item: QRCodeItem) => {
    const fullUrl = `${activeBaseUrl}/${item.id}`;
    try {
      const dataUrl = await generatePrintableQrCard(item, fullUrl, 'QR Hub');
      triggerDownload(dataUrl, `QR_${item.id}.png`);
    } catch (err) {
      console.error('Failed to download QR card:', err);
      const simpleData = await generateQrDataUrl(fullUrl, { width: 800 });
      triggerDownload(simpleData, `QR_${item.id}.png`);
    }
  };

  // Download Bulk ZIP
  const handleDownloadZip = async () => {
    const targetItems =
      selectedIds.size > 0
        ? items.filter((i) => selectedIds.has(i.id))
        : filteredItems;

    if (targetItems.length === 0) return;
    setIsDownloadingZip(true);
    setZipProgress({ current: 0, total: targetItems.length });

    try {
      await downloadBulkAsZip(targetItems, activeBaseUrl, 'card', (current, total) => {
        setZipProgress({ current, total });
      });
    } catch (err) {
      console.error('Failed to create ZIP:', err);
      alert('Gagal membuat file ZIP.');
    } finally {
      setIsDownloadingZip(false);
      setZipProgress(null);
    }
  };

  // Copy Link to clipboard
  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open direct redirect page
  const handleOpenRedirect = (id: string) => {
    navigate(`/${id}`);
  };

  // Lock handler
  const handleLock = () => {
    clearDashboardAuthentication();
    setIsAuthenticated(false);
  };

  // If not authenticated via PIN, show PIN Lock Screen
  if (!isAuthenticated) {
    return <PinLockScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-16 sm:pb-8">
      {/* Header */}
      <DashboardHeader
        onOpenCustomSlug={() => setIsCustomSlugOpen(true)}
        onOpenBulkGenerate={() => setIsBulkOpen(true)}
        onLock={handleLock}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* NFC Format Info */}
        <NfcInfoBanner baseUrl={activeBaseUrl} />

        {/* 4 Metric Cards */}
        <StatsOverview stats={stats} />

        {/* Search, Filter & Bulk Actions Toolbar */}
        <Toolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          totalCount={stats.total}
          activeCount={stats.active}
          emptyCount={stats.empty}
          filteredCount={filteredItems.length}
          selectedCount={selectedIds.size}
          isAllSelected={filteredItems.length > 0 && selectedIds.size === filteredItems.length}
          onToggleSelectAll={handleToggleSelectAll}
          onDownloadZip={handleDownloadZip}
          isDownloadingZip={isDownloadingZip}
          zipProgress={zipProgress}
          onDeleteSelected={handleDeleteSelected}
        />

        {/* Grid List of QR Cards */}
        <QrGrid
          loading={loading}
          error={error}
          onRetry={retry}
          items={filteredItems}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          baseUrl={activeBaseUrl}
          previews={previews}
          selectedIds={selectedIds}
          copiedId={copiedId}
          onToggleSelect={handleToggleSelect}
          onEdit={(it) => setEditingItem(it)}
          onDownload={handleDownloadSingle}
          onDelete={requestDeleteSingle}
          onCopyUrl={handleCopyUrl}
          onOpenRedirect={handleOpenRedirect}
          onOpenBulk={() => setIsBulkOpen(true)}
          onOpenCustomSlug={() => setIsCustomSlugOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-4 bg-slate-900/40 text-center text-[11px] text-slate-500">
        <p>QR Generator & NFC Dynamic Redirect Hub &bull; Firebase Firestore Live</p>
      </footer>

      {/* Modals */}
      <BulkGenerateModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onGenerate={handleBulkGenerate}
        isGenerating={isGenerating}
      />

      <CustomSlugModal
        isOpen={isCustomSlugOpen}
        onClose={() => setIsCustomSlugOpen(false)}
        onSuccess={() => {
          setIsCustomSlugOpen(false);
          confetti({
            particleCount: 50,
            spread: 60,
          });
        }}
        currentShortBaseUrl={activeBaseUrl}
      />

      <EditLinkModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
        onClear={handleClearLink}
        isSaving={isSavingEdit}
      />

      <DeleteConfirmModal
        isOpen={isDeletingModalOpen}
        itemId={itemToDelete}
        onClose={() => {
          setIsDeletingModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDeleteSingle}
        isDeleting={isDeletingProcess}
      />
    </div>
  );
};
