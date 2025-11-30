import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiEye, FiColumns, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useSwing } from '../context/SwingContext';
import { deleteSwing } from '../services/api';
import { getScoreCategory, SCORE_COLORS, SCORE_BG_COLORS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';

const HistoryPage = () => {
  const navigate = useNavigate();
  const {
    swingHistory,
    isLoading,
    loadSwingHistory,
    removeFromHistory,
    selectedSwings,
    toggleSwingSelection,
    clearSelection,
  } = useSwing();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    loadSwingHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    try {
      await deleteSwing(id);
      removeFromHistory(id);
      toast.success('Analysis deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete analysis');
    }
  };

  const handleViewDetails = (swing) => {
    navigate(`/analysis/${swing.id}`);
  };

  const handleCompare = () => {
    if (selectedSwings.length === 2) {
      navigate(`/compare/${selectedSwings[0].id}/${selectedSwings[1].id}`);
    }
  };

  const filteredAndSortedHistory = swingHistory
    .filter(swing => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        swing.overall_assessment?.summary?.toLowerCase().includes(term) ||
        format(new Date(swing.created_at), 'PPP').toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date-asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'score-desc':
          return (b.overall_assessment?.score || 0) - (a.overall_assessment?.score || 0);
        case 'score-asc':
          return (a.overall_assessment?.score || 0) - (b.overall_assessment?.score || 0);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" message="Loading swing history..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Swing History</h1>
          <p className="text-gray-600">
            View and compare your past swing analyses
          </p>
        </div>
        <button
          onClick={loadSwingHistory}
          className="btn-secondary flex items-center gap-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters and Compare */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by date or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-auto"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="score-desc">Highest Score</option>
            <option value="score-asc">Lowest Score</option>
          </select>

          {selectedSwings.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleCompare}
                disabled={selectedSwings.length !== 2}
                className="btn-primary flex items-center gap-2"
              >
                <FiColumns className="w-4 h-4" />
                Compare ({selectedSwings.length}/2)
              </button>
              <button
                onClick={clearSelection}
                className="btn-secondary"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History Grid */}
      {filteredAndSortedHistory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? 'No analyses match your search'
              : 'No swing analyses yet. Upload your first swing to get started!'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/')}
              className="btn-primary mt-4"
            >
              Analyze Your First Swing
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedHistory.map((swing) => {
            const scoreCategory = getScoreCategory(swing.overall_assessment?.score || 0);
            const isSelected = selectedSwings.some(s => s.id === swing.id);

            return (
              <div
                key={swing.id}
                onClick={() => toggleSwingSelection(swing)}
                className={`card cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-golf-green-500' : ''
                }`}
              >
                <div className="p-6">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <FiCalendar className="w-4 h-4" />
                    {format(new Date(swing.created_at), 'PPP')}
                  </div>

                  {/* Score */}
                  <div className={`${SCORE_BG_COLORS[scoreCategory]} ${SCORE_COLORS[scoreCategory]} inline-block px-4 py-2 rounded-lg mb-3`}>
                    <div className="text-xs font-medium">Score</div>
                    <div className="text-2xl font-bold">
                      {swing.overall_assessment?.score || 'N/A'}/100
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                    {swing.overall_assessment?.summary || 'No summary available'}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(swing);
                      }}
                      className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1"
                    >
                      <FiEye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={(e) => handleDelete(swing.id, e)}
                      className="btn-secondary text-sm py-2 px-3 text-red-600 hover:bg-red-50 border-red-300"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
