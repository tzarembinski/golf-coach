import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiSave, FiRefreshCw } from 'react-icons/fi';
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

  const scoreCategory = getScoreCategory(analysis.overall_assessment?.score || 0);

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
                {analysis.overall_assessment?.score || 'N/A'}/100
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {analysis.overall_assessment?.summary || 'No summary available'}
              </p>
            </div>

            {analysis.overall_assessment?.key_issues &&
             analysis.overall_assessment.key_issues.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Key Issues</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {analysis.overall_assessment.key_issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.overall_assessment?.recommendations &&
             analysis.overall_assessment.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {analysis.overall_assessment.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Position-by-Position Analysis */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Detailed Position Analysis
        </h2>
        <div className="space-y-3">
          {renderPositionAnalysis('address', analysis.positions?.address)}
          {renderPositionAnalysis('top', analysis.positions?.top)}
          {renderPositionAnalysis('impact', analysis.positions?.impact)}
          {renderPositionAnalysis('follow_through', analysis.positions?.follow_through)}
        </div>
      </div>

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
