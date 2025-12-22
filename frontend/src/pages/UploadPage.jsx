import { useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';
import AnalysisResults from '../components/AnalysisResults';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyzeSwing } from '../services/api';
import { useSwing } from '../context/SwingContext';
import { SWING_POSITIONS, SHOT_OUTCOMES } from '../utils/constants';

const UploadPage = () => {
  const [images, setImages] = useState({
    address: null,
    top: null,
    impact: null,
    follow_through: null,
  });
  const [annotation, setAnnotation] = useState({
    club: '',
    shotOutcome: '',
    focusArea: '',
    notes: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { addAnalysisToHistory } = useSwing();

  const handleImageChange = (position, file) => {
    setImages(prev => ({
      ...prev,
      [position]: file,
    }));
  };

  const handleImageRemove = (position) => {
    setImages(prev => ({
      ...prev,
      [position]: null,
    }));
  };

  const hasAnyImage = Object.values(images).some(img => img !== null);

  const handleAnnotationChange = (field, value) => {
    setAnnotation(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAnalyze = async () => {
    if (!hasAnyImage) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await analyzeSwing(images, annotation);
      setAnalysisResult(result);
      addAnalysisToHistory(result);
      toast.success('Analysis complete!');

      // Scroll to results
      setTimeout(() => {
        document.getElementById('analysis-results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to analyze swing. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setImages({
      address: null,
      top: null,
      impact: null,
      follow_through: null,
    });
    setAnnotation({
      club: '',
      shotOutcome: '',
      focusArea: '',
      notes: '',
    });
    setAnalysisResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Golf Swing Analyzer
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload images of your golf swing positions and get AI-powered analysis
          and personalized recommendations from Claude.
        </p>
      </div>

      {/* Upload Section */}
      {!analysisResult && (
        <div className="space-y-8">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Upload Swing Images
            </h2>
            <p className="text-gray-600 mb-6">
              Upload images for one or more swing positions. The more positions you provide,
              the more comprehensive the analysis will be.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ImageUpload
                position={SWING_POSITIONS.ADDRESS}
                image={images.address}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
              />
              <ImageUpload
                position={SWING_POSITIONS.TOP}
                image={images.top}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
              />
              <ImageUpload
                position={SWING_POSITIONS.IMPACT}
                image={images.impact}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
              />
              <ImageUpload
                position={SWING_POSITIONS.FOLLOW_THROUGH}
                image={images.follow_through}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
              />
            </div>

            {/* Shot Annotation Section */}
            <div className="border-t border-gray-200 pt-6 mt-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Shot Context (Optional but Recommended)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Providing context helps Claude give you more personalized and accurate feedback.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Club */}
                <div>
                  <label htmlFor="club" className="block text-sm font-medium text-gray-700 mb-1">
                    Club Used
                  </label>
                  <input
                    type="text"
                    id="club"
                    placeholder="e.g., Driver, 7-iron, Pitching wedge"
                    value={annotation.club}
                    onChange={(e) => handleAnnotationChange('club', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golf-green-500"
                  />
                </div>

                {/* Shot Outcome */}
                <div>
                  <label htmlFor="shotOutcome" className="block text-sm font-medium text-gray-700 mb-1">
                    Shot Outcome
                  </label>
                  <select
                    id="shotOutcome"
                    value={annotation.shotOutcome}
                    onChange={(e) => handleAnnotationChange('shotOutcome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golf-green-500"
                  >
                    <option value="">Select outcome...</option>
                    {SHOT_OUTCOMES.map(outcome => (
                      <option key={outcome} value={outcome}>{outcome}</option>
                    ))}
                  </select>
                </div>

                {/* Focus Area */}
                <div className="md:col-span-2">
                  <label htmlFor="focusArea" className="block text-sm font-medium text-gray-700 mb-1">
                    What were you working on?
                  </label>
                  <input
                    type="text"
                    id="focusArea"
                    placeholder="e.g., keeping head still, hip rotation, weight transfer"
                    value={annotation.focusArea}
                    onChange={(e) => handleAnnotationChange('focusArea', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golf-green-500"
                  />
                </div>

                {/* Additional Notes */}
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    rows="3"
                    placeholder="Any other context that might be helpful for analysis..."
                    value={annotation.notes}
                    onChange={(e) => handleAnnotationChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golf-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleAnalyze}
                disabled={!hasAnyImage || isAnalyzing}
                className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
              >
                <FiUploadCloud className="w-5 h-5" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze Swing'}
              </button>
            </div>
          </div>

          {isAnalyzing && (
            <div className="card p-12">
              <LoadingSpinner size="xl" message="Analyzing your swing with Claude AI..." />
              <p className="text-center text-gray-500 mt-4">
                This may take a few moments
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {analysisResult && !isAnalyzing && (
        <div id="analysis-results">
          <AnalysisResults
            analysis={analysisResult}
            onAnalyzeAnother={handleAnalyzeAnother}
          />
        </div>
      )}
    </div>
  );
};

export default UploadPage;
