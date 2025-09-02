'use client';

import { useState, useEffect } from 'react';
import { IPersonalAnalysis } from '@/models/PersonalAnalysis';

interface PersonalAnalysisForm {
  ticker: string;
  assetName: string;
  tendency: 'bullish' | 'bearish' | 'neutral';
  timeFrame: 'short-term' | 'mid-term' | 'long-term';
  description: string;
  explanation: string;
  targetPrice: string;
  stopLoss: string;
  confidence: string;
}

const initialFormState: PersonalAnalysisForm = {
  ticker: '',
  assetName: '',
  tendency: 'neutral',
  timeFrame: 'mid-term',
  description: '',
  explanation: '',
  targetPrice: '',
  stopLoss: '',
  confidence: '5',
};

export default function PersonalAnalysisManager() {
  const [analyses, setAnalyses] = useState<IPersonalAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PersonalAnalysisForm>(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/personal-analyses');
      if (!res.ok) throw new Error('Failed to fetch analyses');
      const data = await res.json();
      setAnalyses(data.analyses);
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
      const payload = {
        ...formData,
        targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
        stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
        confidence: parseInt(formData.confidence),
      };

      const url = editingId 
        ? `/api/personal-analyses/${editingId}`
        : '/api/personal-analyses';
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save analysis');
      }

      await fetchAnalyses();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save analysis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (analysis: IPersonalAnalysis) => {
    setFormData({
      ticker: analysis.ticker,
      assetName: analysis.assetName,
      tendency: analysis.tendency,
      timeFrame: analysis.timeFrame,
      description: analysis.description || '',
      explanation: analysis.explanation || '',
      targetPrice: analysis.targetPrice?.toString() || '',
      stopLoss: analysis.stopLoss?.toString() || '',
      confidence: analysis.confidence.toString(),
    });
    setEditingId(analysis._id || null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      const res = await fetch(`/api/personal-analyses/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete analysis');
      await fetchAnalyses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete analysis');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/personal-analyses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) throw new Error('Failed to update analysis');
      await fetchAnalyses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update analysis');
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsFormOpen(false);
  };

  if (loading) return <div>Loading analyses...</div>;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Personal Investment Analyses</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Add New Analysis
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
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Analysis' : 'Add New Analysis'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ticker *</label>
                  <input
                    type="text"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Asset Name *</label>
                  <input
                    type="text"
                    value={formData.assetName}
                    onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tendency *</label>
                  <select
                    value={formData.tendency}
                    onChange={(e) => setFormData({ ...formData, tendency: e.target.value as 'bullish' | 'bearish' | 'neutral' })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    required
                  >
                    <option value="bullish">Bullish</option>
                    <option value="bearish">Bearish</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Frame *</label>
                  <select
                    value={formData.timeFrame}
                    onChange={(e) => setFormData({ ...formData, timeFrame: e.target.value as 'short-term' | 'mid-term' | 'long-term' })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    required
                  >
                    <option value="short-term">Short Term</option>
                    <option value="mid-term">Mid Term</option>
                    <option value="long-term">Long Term</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confidence (1-10) *</label>
                  <select
                    value={formData.confidence}
                    onChange={(e) => setFormData({ ...formData, confidence: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    required
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetPrice}
                    onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stop Loss</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.stopLoss}
                    onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {formData.description.length}/500 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Explanation</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  rows={4}
                  maxLength={2000}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {formData.explanation.length}/2000 characters
                </div>
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

      {/* Analyses List */}
      <div className="space-y-4">
        {analyses.map((analysis) => (
          <div key={analysis._id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">
                  {analysis.ticker} - {analysis.assetName}
                </h3>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    analysis.tendency === 'bullish' ? 'bg-green-900 text-green-300' :
                    analysis.tendency === 'bearish' ? 'bg-red-900 text-red-300' :
                    'bg-yellow-900 text-yellow-300'
                  }`}>
                    {analysis.tendency.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-sm">
                    {analysis.timeFrame.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-purple-900 text-purple-300 rounded text-sm">
                    Confidence: {analysis.confidence}/10
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    analysis.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {analysis.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleActive(analysis._id!, analysis.isActive)}
                  className={`px-3 py-1 rounded text-sm ${
                    analysis.isActive 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {analysis.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleEdit(analysis)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(analysis._id!)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            {(analysis.targetPrice || analysis.stopLoss) && (
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                {analysis.targetPrice && (
                  <div>
                    <span className="text-gray-400">Target Price:</span>
                    <span className="font-mono ml-2">${analysis.targetPrice}</span>
                  </div>
                )}
                {analysis.stopLoss && (
                  <div>
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="font-mono ml-2">${analysis.stopLoss}</span>
                  </div>
                )}
              </div>
            )}

            {analysis.description && (
              <div className="mb-3">
                <h4 className="font-semibold text-gray-300 mb-1">Description:</h4>
                <p className="text-gray-400">{analysis.description}</p>
              </div>
            )}

            {analysis.explanation && (
              <div className="mb-3">
                <h4 className="font-semibold text-gray-300 mb-1">Explanation:</h4>
                <p className="text-gray-400">{analysis.explanation}</p>
              </div>
            )}

            <div className="text-xs text-gray-500 mt-4">
              Created: {new Date(analysis.createdAt).toLocaleDateString()} | 
              Updated: {new Date(analysis.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}

        {analyses.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No personal analyses found. Create your first analysis to get started.
          </div>
        )}
      </div>
    </div>
  );
}
