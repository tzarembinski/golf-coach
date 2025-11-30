import { useState, useRef } from 'react';
import { FiUpload, FiCamera, FiX } from 'react-icons/fi';
import imageCompression from 'browser-image-compression';
import { validateImage, createImagePreview, revokeImagePreview } from '../utils/imageUtils';
import { SWING_POSITION_LABELS, SWING_POSITION_DESCRIPTIONS } from '../utils/constants';
import toast from 'react-hot-toast';

const ImageUpload = ({ position, image, onImageChange, onImageRemove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const compressImage = async (file) => {
    const MAX_SIZE_MB = 2;
    const fileSizeMB = file.size / 1024 / 1024;

    // If file is already under 2MB, return as-is
    if (fileSizeMB <= MAX_SIZE_MB) {
      return file;
    }

    try {
      setIsCompressing(true);

      const options = {
        maxSizeMB: MAX_SIZE_MB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        quality: 0.8,
      };

      const compressedFile = await imageCompression(file, options);
      const originalSizeMB = fileSizeMB.toFixed(2);
      const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);

      toast.success(
        `Image compressed: ${originalSizeMB}MB → ${compressedSizeMB}MB`,
        { duration: 4000 }
      );

      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      toast.error('Failed to compress image. Using original.');
      return file;
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFile = async (file) => {
    const validation = validateImage(file);

    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    // Compress image if needed
    const processedFile = await compressImage(file);

    // Clean up old preview
    if (preview) {
      revokeImagePreview(preview);
    }

    const previewUrl = createImagePreview(processedFile);
    setPreview(previewUrl);
    onImageChange(position, processedFile);

    if (!isCompressing) {
      toast.success(`${SWING_POSITION_LABELS[position]} image uploaded`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = () => {
    if (preview) {
      revokeImagePreview(preview);
    }
    setPreview(null);
    onImageRemove(position);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">
            {SWING_POSITION_LABELS[position]}
          </h3>
          <p className="text-sm text-gray-500">
            {SWING_POSITION_DESCRIPTIONS[position]}
          </p>
        </div>
        {preview && (
          <button
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove image"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg transition-all ${
          isDragging
            ? 'border-golf-green-500 bg-golf-green-50'
            : preview
            ? 'border-golf-green-300'
            : 'border-gray-300 hover:border-golf-green-400'
        } ${preview ? 'p-2' : 'p-6'}`}
      >
        {isCompressing ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-golf-green-200 border-t-golf-green-600"></div>
            <p className="text-sm text-gray-600 font-medium">Compressing image...</p>
          </div>
        ) : preview ? (
          <div className="relative">
            <img
              src={preview}
              alt={SWING_POSITION_LABELS[position]}
              className="w-full h-48 object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3">
            <FiUpload className="w-10 h-10 text-gray-400" />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Drag and drop an image here, or
              </p>
              <div className="flex gap-2 mt-2 justify-center">
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="text-sm text-golf-green-600 hover:text-golf-green-700 font-medium"
                >
                  browse files
                </button>
                <span className="text-sm text-gray-400">or</span>
                <button
                  type="button"
                  onClick={openCamera}
                  className="text-sm text-golf-green-600 hover:text-golf-green-700 font-medium flex items-center gap-1"
                >
                  <FiCamera className="w-4 h-4" />
                  use camera
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                PNG, JPG, WebP • Auto-compressed to 2MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageUpload;
