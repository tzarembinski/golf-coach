import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getSwingById } from '../services/api';
import AnalysisResults from '../components/AnalysisResults';
import LoadingSpinner from '../components/LoadingSpinner';

const AnalysisDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    try {
      setIsLoading(true);
      const data = await getSwingById(id);
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to load analysis:', error);
      toast.error('Failed to load analysis');
      navigate('/history');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" message="Loading analysis..." />
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

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

      {/* Analysis Results */}
      <AnalysisResults
        analysis={analysis}
        onAnalyzeAnother={() => navigate('/')}
      />
    </div>
  );
};

export default AnalysisDetailPage;
