'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (location: { x: number; y: number }) => {
    setCrop(location);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;
    
    setIsProcessing(true);
    try {
      const image = new Image();
      image.src = imageSrc;
      
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size to match cropped area (1:1 aspect ratio)
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Draw the cropped image
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // Convert to base64
      const croppedImageBase64 = canvas.toDataURL('image/jpeg', 0.9);
      onCropComplete(croppedImageBase64);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 sm:px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">Crop Image</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Adjust the image to fit 1:1 square ratio</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white text-3xl font-bold leading-none transition-colors"
          disabled={isProcessing}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative min-h-0">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteHandler}
          style={{
            containerStyle: {
              backgroundColor: '#000',
            },
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Zoom Slider */}
        <div className="flex items-center gap-3 sm:gap-4">
          <label className="text-xs sm:text-sm font-medium text-gray-300 min-w-[50px] sm:min-w-[60px]">
            Zoom:
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            disabled={isProcessing}
          />
          <span className="text-xs sm:text-sm text-gray-400 min-w-[45px] text-right font-mono">
            {zoom.toFixed(1)}x
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full sm:w-auto px-6 py-3 border-2 border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
          <button
            onClick={createCroppedImage}
            disabled={isProcessing}
            className="w-full sm:flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg"
          >
            {isProcessing ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Crop & Continue
              </>
            )}
          </button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 text-center">
          💡 Drag to reposition • Pinch or use slider to zoom
        </p>
      </div>
    </div>
  );
}
