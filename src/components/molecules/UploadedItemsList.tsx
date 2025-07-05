import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { ContentType } from '@/types';
import { StorageService } from '@/services';

export interface UploadedItem {
  id: string;
  name: string;
  type: 'document' | 'youtube';
  uploadedAt: Date;
  size?: number;
  url?: string;
}

export interface UploadedItemsListProps {
  onRefresh?: () => void;
  onItemDelete?: (id: string) => void;
}

export function UploadedItemsList({
  onRefresh,
  onItemDelete,
}: UploadedItemsListProps) {
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storageService = useMemo(() => new StorageService(), []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const content = await storageService.getAllContent();
      const uploadedItems: UploadedItem[] = content.map(item => ({
        id: item.id,
        name: item.title,
        type: item.type === ContentType.VIDEO ? 'youtube' : 'document',
        uploadedAt: item.createdAt,
        size: item.metadata.fileSize as number | undefined,
        url: item.youtubeUrl || undefined,
      }));

      setItems(uploadedItems);
    } catch (err) {
      setError('Failed to load uploaded items');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  }, [storageService]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDelete = async (id: string) => {
    try {
      await storageService.deleteContent(id);
      setItems(items.filter(item => item.id !== id));
      onItemDelete?.(id);
    } catch (err) {
      setError('Failed to delete item');
      console.error('Error deleting item:', err);
    }
  };

  const handleRefresh = () => {
    loadItems();
    onRefresh?.();
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getItemIcon = (type: 'document' | 'youtube') => {
    return type === 'youtube' ? '🎥' : '📄';
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="text-2xl">⏳</div>
          <span className="ml-2 text-gray-600">Loading uploaded items...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="primary" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Uploaded Items ({items.length})
        </h2>
        <Button variant="ghost" onClick={handleRefresh}>
          🔄 Refresh
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📁</div>
          <p className="text-gray-600">No items uploaded yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Upload documents or add YouTube links to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{getItemIcon(item.type)}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      {item.type === 'youtube' ? 'YouTube Video' : 'Document'}
                    </span>
                    {item.size && <span>{formatFileSize(item.size)}</span>}
                    <span>Uploaded {formatDate(item.uploadedAt)}</span>
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View original →
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
