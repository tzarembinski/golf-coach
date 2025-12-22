import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiSave, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { base64ToBlob } from '../utils/imageUtils';
import { SWING_POSITION_LABELS, getScoreCategory, SCORE_COLORS, SCORE_BG_COLORS } from '../utils/constants';

const AnalysisResults = ({ analysis, onSave, onAnalyzeAnother }) => {
  const [expandedSections, setExpandedSections] = useState({
    address: true,
    top: false,
    impact: false,
    follow_through: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Extract progression analysis section from full analysis text
  const extractProgressionAnalysis = (analysisText) => {
    if (!analysisText) return null;

    // Look for progression analysis section (case-insensitive)
    const progressionMatch = analysisText.match(/5\.\s*PROGRESSION ANALYSIS[^\n]*\n([\s\S]*?)(?=\n\n[A-Z]|$)/i);

    if (progressionMatch && progressionMatch[1]) {
      return progressionMatch[1].trim();
    }

    return null;
  };

  // Extract main analysis (without progression section)
  const extractMainAnalysis = (analysisText) => {
    if (!analysisText) return '';

    // Remove progression analysis section if it exists
    const mainAnalysis = analysisText.replace(/5\.\s*PROGRESSION ANALYSIS[^\n]*\n[\s\S]*$/i, '').trim();

    return mainAnalysis;
  };

  const renderPositionAnalysis = (position, data) => {
    if (!data) return null;

    const isExpanded = expandedSections[position];
    const hasImage = data.image_data;

    return (
      <div key={position} className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(position)}
          className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900">
              {SWING_POSITION_LABELS[position]}
            </span>
            {hasImage && (
              <span className="text-xs bg-golf-green-100 text-golf-green-700 px-2 py-1 rounded">
                Image Analyzed
              </span>
            )}
          </div>
          {isExpanded ? (
            <FiChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <FiChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            {hasImage && (
              <div className="mb-4">
                <img
                  src={base64ToBlob(data.image_data)}
                  alt={SWING_POSITION_LABELS[position]}
                  className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                />
              </div>
            )}
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {data.analysis || 'No analysis available'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Convert rating (1-10) to score (0-100)
  const score = analysis.rating ? analysis.rating * 10 : 0;
  const scoreCategory = getScoreCategory(score);

  // Extract progression analysis and main analysis
  const progressionAnalysis = extractProgressionAnalysis(analysis.analysis);
  const mainAnalysis = extractMainAnalysis(analysis.analysis);

  return (
    <div className="space-y-6">
      {/* Overall Assessment */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Overall Assessment
          </h2>

          <div className="flex items-center gap-4 mb-4">
            <div className={`${SCORE_BG_COLORS[scoreCategory]} ${SCORE_COLORS[scoreCategory]} px-6 py-3 rounded-lg`}>
              <div className="text-sm font-medium">Overall Score</div>
              <div className="text-3xl font-bold">
                {score || 'N/A'}/100
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {analysis.summary || 'No summary available'}
              </p>
            </div>

            {mainAnalysis && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Detailed Analysis</h3>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {mainAnalysis}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progression Analysis */}
      {progressionAnalysis && (
        <div className="card border-2 border-blue-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiTrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Progression Analysis
              </h2>
            </div>
            <p className="text-sm text-blue-600 mb-4">
              Comparison with your previous swings
            </p>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {progressionAnalysis}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onAnalyzeAnother}
          className="btn-primary flex items-center gap-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          Analyze Another Swing
        </button>
      </div>
    </div>
  );
};

export default AnalysisResults;
