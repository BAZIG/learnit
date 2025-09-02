'use client';

import { useState, useEffect } from 'react';
import { INews } from '@/models/News';

interface AffectedAsset {
  ticker: string;
  impact: 'bullish' | 'bearish' | 'neutral';
}

interface NewsForm {
  title: string;
  event: string;
  affectedAssets: AffectedAsset[];
  expectations: string;
  isPublished: boolean;
}

const initialFormState: NewsForm = {
  title: '',
  event: '',
  affectedAssets: [],
  expectations: '',
  isPublished: false,
};

export default function NewsManager() {
  const [news, setNews] = useState<INews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewsForm>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [newAsset, setNewAsset] = useState({ ticker: '', impact: 'neutral' as const });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/news');
      if (!res.ok) throw new Error('Failed to fetch news');
      const data = await res.json();
      setNews(data.news);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = editingId ? `/api/news/${editingId}` : '/api/news';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save news');
      }

      await fetchNews();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save news');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (newsItem: INews) => {
    setFormData({
      title: newsItem.title,
      event: newsItem.event,
      affectedAssets: newsItem.affectedAssets,
      expectations: newsItem.expectations,
      isPublished: newsItem.isPublished,
    });
    setEditingId(newsItem._id || null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return;

    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete news');
      await fetchNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete news');
    }
  };

  const togglePublished = async (id: string, isPublished: boolean) => {
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished }),
      });

      if (!res.ok) throw new Error('Failed to update news');
      await fetchNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update news');
    }
  };

  const addAffectedAsset = () => {
    if (!newAsset.ticker.trim()) return;
    
    const exists = formData.affectedAssets.some(
      asset => asset.ticker.toUpperCase() === newAsset.ticker.toUpperCase()
    );
    
    if (exists) {
      alert('This ticker is already in the affected assets list');
      return;
    }

    setFormData({
      ...formData,
      affectedAssets: [
        ...formData.affectedAssets,
        { ...newAsset, ticker: newAsset.ticker.toUpperCase() }
      ]
    });
    setNewAsset({ ticker: '', impact: 'neutral' });
  };

  const removeAffectedAsset = (index: number) => {
    setFormData({
      ...formData,
      affectedAssets: formData.affectedAssets.filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsFormOpen(false);
    setNewAsset({ ticker: '', impact: 'neutral' });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'bullish': return 'text-green-400 bg-green-900';
      case 'bearish': return 'text-red-400 bg-red-900';
      default: return 'text-yellow-400 bg-yellow-900';
    }
  };

  if (loading) return <div>Loading news...</div>;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">News Management</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Add News
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? 'Edit News' : 'Add News'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  maxLength={200}
                  required
                />
                <div className="text-xs text-gray-400 mt-1">
                  {formData.title.length}/200 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Event Description *</label>
                <textarea
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  rows={4}
                  maxLength={1000}
                  required
                />
                <div className="text-xs text-gray-400 mt-1">
                  {formData.event.length}/1000 characters
                </div>
              </div>

              {/* Affected Assets */}
              <div>
                <label className="block text-sm font-medium mb-2">Affected Assets</label>
                
                {/* Add new asset */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Ticker (e.g., AAPL)"
                    value={newAsset.ticker}
                    onChange={(e) => setNewAsset({ ...newAsset, ticker: e.target.value.toUpperCase() })}
                    className="bg-gray-700 text-white rounded px-3 py-2 flex-1"
                  />
                  <select
                    value={newAsset.impact}
                    onChange={(e) => setNewAsset({ ...newAsset, impact: e.target.value as 'bullish' | 'bearish' | 'neutral' })}
                    className="bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="bullish">Bullish</option>
                    <option value="bearish">Bearish</option>
                  </select>
                  <button
                    type="button"
                    onClick={addAffectedAsset}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Add
                  </button>
                </div>

                {/* Current assets */}
                <div className="flex flex-wrap gap-2">
                  {formData.affectedAssets.map((asset, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 px-3 py-1 rounded ${getImpactColor(asset.impact)}`}
                    >
                      <span className="font-mono">{asset.ticker}</span>
                      <span className="text-xs">({asset.impact})</span>
                      <button
                        type="button"
                        onClick={() => removeAffectedAsset(index)}
                        className="text-white hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expectations & Analysis *</label>
                <textarea
                  value={formData.expectations}
                  onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  rows={5}
                  maxLength={2000}
                  required
                />
                <div className="text-xs text-gray-400 mt-1">
                  {formData.expectations.length}/2000 characters
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isPublished" className="text-sm">
                  Publish immediately
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded"
                >
                  {submitting ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* News List */}
      <div className="space-y-4">
        {news.map((newsItem) => (
          <div key={newsItem._id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{newsItem.title}</h3>
                <div className="flex items-center space-x-4 mb-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    newsItem.isPublished ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {newsItem.isPublished ? 'Published' : 'Draft'}
                  </span>
                  {newsItem.publishedAt && (
                    <span className="text-sm text-gray-400">
                      Published: {new Date(newsItem.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => togglePublished(newsItem._id!, newsItem.isPublished)}
                  className={`px-3 py-1 rounded text-sm ${
                    newsItem.isPublished 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {newsItem.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleEdit(newsItem)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(newsItem._id!)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-300 mb-2">Event:</h4>
              <p className="text-gray-400 leading-relaxed">{newsItem.event}</p>
            </div>

            {newsItem.affectedAssets.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-300 mb-2">Affected Assets:</h4>
                <div className="flex flex-wrap gap-2">
                  {newsItem.affectedAssets.map((asset, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(asset.impact)}`}
                    >
                      {asset.ticker} ({asset.impact})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-semibold text-gray-300 mb-2">Expectations:</h4>
              <p className="text-gray-400 leading-relaxed">{newsItem.expectations}</p>
            </div>

            <div className="text-xs text-gray-500">
              Created: {new Date(newsItem.createdAt).toLocaleDateString()} | 
              Updated: {new Date(newsItem.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}

        {news.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No news items found. Create your first news item to get started.
          </div>
        )}
      </div>
    </div>
  );
}
