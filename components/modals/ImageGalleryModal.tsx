// components/modals/ImageGalleryModal.tsx
"use client";

import { useState } from 'react';
import { FaTimes, FaDownload, FaTrash, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface GroupImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
  uploadedBy: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  uploadedAt: Date;
  fileSize: number;
  fileName: string;
}

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GroupImage[];
  onDeleteImage?: (imageId: string) => void;
  currentUserId: string;
  isOwner: boolean;
}

const ImageGalleryModal = ({ 
  isOpen, 
  onClose, 
  images, 
  onDeleteImage, 
  currentUserId, 
  isOwner 
}: ImageGalleryModalProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setViewMode('detail');
  };

  const handlePrevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handleDownload = async (image: GroupImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const canDeleteImage = (image: GroupImage) => {
    return isOwner || image.uploadedBy.id === currentUserId;
  };

  if (!isOpen) return null;

  const selectedImage = selectedImageIndex !== null ? images[selectedImageIndex] : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Group Images</h2>
            <span className="text-gray-400 text-sm">({images.length} images)</span>
          </div>
          <div className="flex items-center gap-3">
            {viewMode === 'detail' && (
              <button
                onClick={() => {
                  setViewMode('grid');
                  setSelectedImageIndex(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
                title="Back to grid"
              >
                <FaTimes className="text-lg" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'grid' ? (
            // Grid View
            <div className="p-6">
              {images.length === 0 ? (
                <div className="text-center py-12">
                  <FaEye className="text-6xl text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl text-gray-400 mb-2">No images yet</h3>
                  <p className="text-gray-500">Start sharing images with your group!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className="group relative bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      onClick={() => handleImageClick(index)}
                    >
                      <img
                        src={image.url}
                        alt={image.title || image.fileName}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <FaEye className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      {/* Image Info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-white text-xs font-medium truncate">
                          {image.title || image.fileName}
                        </p>
                        <p className="text-gray-300 text-xs">
                          by {image.uploadedBy.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Detail View
            selectedImage && (
              <div className="flex h-full">
                {/* Image Display */}
                <div className="flex-1 bg-black flex items-center justify-center relative">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title || selectedImage.fileName}
                    className="max-w-full max-h-full object-contain"
                  />
                  
                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        disabled={selectedImageIndex === 0}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        onClick={handleNextImage}
                        disabled={selectedImageIndex === images.length - 1}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                </div>
                
                {/* Image Details Sidebar */}
                <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Title */}
                    {selectedImage.title && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {selectedImage.title}
                        </h3>
                      </div>
                    )}
                    
                    {/* Description */}
                    {selectedImage.description && (
                      <div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {selectedImage.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Uploader Info */}
                    <div className="flex items-center gap-3 py-3 border-t border-gray-700">
                      {selectedImage.uploadedBy.avatarUrl && (
                        <img
                          src={selectedImage.uploadedBy.avatarUrl}
                          alt={selectedImage.uploadedBy.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-white font-medium text-sm">
                          {selectedImage.uploadedBy.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {formatDate(selectedImage.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    
                    {/* File Info */}
                    <div className="space-y-2 py-3 border-t border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">File name:</span>
                        <span className="text-white truncate ml-2">
                          {selectedImage.fileName}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">File size:</span>
                        <span className="text-white">
                          {formatFileSize(selectedImage.fileSize)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="space-y-2 pt-3 border-t border-gray-700">
                      <button
                        onClick={() => handleDownload(selectedImage)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaDownload className="text-sm" />
                        Download
                      </button>
                      
                      {canDeleteImage(selectedImage) && onDeleteImage && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this image?')) {
                              onDeleteImage(selectedImage.id);
                              if (images.length === 1) {
                                setViewMode('grid');
                                setSelectedImageIndex(null);
                              } else {
                                const newIndex = selectedImageIndex === images.length - 1 
                                  ? selectedImageIndex - 1 
                                  : selectedImageIndex;
                                setSelectedImageIndex(newIndex);
                              }
                            }
                          }}
                          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaTrash className="text-sm" />
                          Delete Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryModal;