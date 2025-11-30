import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getSwingById } from '../services/api';
import { getScoreCategory, SCORE_COLORS, SCORE_BG_COLORS, SWING_POSITION_LABELS } from '../utils/constants';
import { base64ToBlob } from '../utils/imageUtils';
import LoadingSpinner from '../components/LoadingSpinner';

const ComparisonPage = () => {
  const { id1, id2 } = useParams();
  const navigate = useNavigate();
  const [swing1, setSwing1] = useState(null);
  const [swing2, setSwing2] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSwings();
  }, [id1, id2]);

  const loadSwings = async () => {
    try {
      setIsLoading(true);
      const [data1, data2] = await Promise.all([
        getSwingById(id1),
        getSwingById(id2),
      ]);
      setSwing1(data1);
      setSwing2(data2);
    } catch (error) {
      console.error('Failed to load swings:', error);
      toast.error('Failed to load swing data');
      navigate('/history');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" message="Loading comparison..." />
      </div>
    );
  }

  if (!swing1 || !swing2) {
    return null;
  }

  const scoreCategory1 = getScoreCategory(swing1.overall_assessment?.score || 0);
  const scoreCategory2 = getScoreCategory(swing2.overall_assessment?.score || 0);

  const positions = ['address', 'top', 'impact', 'follow_through'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/history')}
        className="btn-secondary flex items-center gap-2 mb-6"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to History
      </button>

      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Swing Comparison
      </h1>

      {/* Overall Scores Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Swing 1 */}
        <div className="card p-6">
          <div className="text-sm text-gray-500 mb-2">
            {format(new Date(swing1.created_at), 'PPP')}
          </div>
          <div className={`${SCORE_BG_COLORS[scoreCategory1]} ${SCORE_COLORS[scoreCategory1]} inline-block px-6 py-3 rounded-lg mb-4`}>
            <div className="text-sm font-medium">Overall Score</div>
            <div className="text-3xl font-bold">
              {swing1.overall_assessment?.score || 'N/A'}/100
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
          <p className="text-gray-700 text-sm">
            {swing1.overall_assessment?.summary || 'No summary available'}
          </p>
        </div>

        {/* Swing 2 */}
        <div className="card p-6">
          <div className="text-sm text-gray-500 mb-2">
            {format(new Date(swing2.created_at), 'PPP')}
          </div>
          <div className={`${SCORE_BG_COLORS[scoreCategory2]} ${SCORE_COLORS[scoreCategory2]} inline-block px-6 py-3 rounded-lg mb-4`}>
            <div className="text-sm font-medium">Overall Score</div>
            <div className="text-3xl font-bold">
              {swing2.overall_assessment?.score || 'N/A'}/100
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
          <p className="text-gray-700 text-sm">
            {swing2.overall_assessment?.summary || 'No summary available'}
          </p>
        </div>
      </div>

      {/* Position-by-Position Comparison */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Position-by-Position Comparison
        </h2>

        {positions.map((position) => {
          const pos1 = swing1.positions?.[position];
          const pos2 = swing2.positions?.[position];

          if (!pos1 && !pos2) return null;

          return (
            <div key={position} className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {SWING_POSITION_LABELS[position]}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Position 1 */}
                <div>
                  {pos1?.image_data && (
                    <img
                      src={base64ToBlob(pos1.image_data)}
                      alt={`${SWING_POSITION_LABELS[position]} - Swing 1`}
                      className="w-full rounded-lg shadow-sm mb-4"
                    />
                  )}
                  {pos1?.analysis ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 text-sm">
                        {pos1.analysis}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      No analysis for this position
                    </p>
                  )}
                </div>

                {/* Position 2 */}
                <div>
                  {pos2?.image_data && (
                    <img
                      src={base64ToBlob(pos2.image_data)}
                      alt={`${SWING_POSITION_LABELS[position]} - Swing 2`}
                      className="w-full rounded-lg shadow-sm mb-4"
                    />
                  )}
                  {pos2?.analysis ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 text-sm">
                        {pos2.analysis}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      No analysis for this position
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Differences Section */}
      <div className="mt-8 card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Key Observations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Swing 1 Issues */}
          {swing1.overall_assessment?.key_issues &&
           swing1.overall_assessment.key_issues.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Swing 1 - Key Issues
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                {swing1.overall_assessment.key_issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Swing 2 Issues */}
          {swing2.overall_assessment?.key_issues &&
           swing2.overall_assessment.key_issues.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Swing 2 - Key Issues
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                {swing2.overall_assessment.key_issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;
