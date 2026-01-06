'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiUpload, 
  FiImage, 
  FiCheck, 
  FiX,
  FiEye,
  FiTrash2,
  FiRefreshCw
} from 'react-icons/fi';

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'hero',
    type: 'hero'
  });
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    { value: 'hero', label: 'Hero Images', color: 'bg-blue-100 text-blue-800' },
    { value: 'service', label: 'Service Images', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'product', label: 'Product Images', color: 'bg-amber-100 text-amber-800' },
    { value: 'client', label: 'Client Images', color: 'bg-violet-100 text-violet-800' },
    { value: 'general', label: 'General Images', color: 'bg-gray-100 text-gray-800' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setFormData(prev => ({
      ...prev,
      title: file.name.replace(/\.[^/.]+$/, "")
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData(e.target);
    
    if (!formDataObj.get('image')) {
      alert('Please select an image to upload');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj
      });

      const result = await response.json();

      if (response.ok) {
        // Simulate progress
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 95) {
              clearInterval(interval);
              return 100;
            }
            return prev + 5;
          });
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          setUploading(false);
          setProgress(100);
          
          alert('Upload successful!');
          setPreview(null);
          setFormData({
            title: '',
            description: '',
            category: 'hero',
            type: 'hero'
          });
          
          // Refresh image list
          fetchImages();
        }, 2000);

      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
      setUploading(false);
      setProgress(0);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images');
      const result = await response.json();
      if (result.success) {
        setImages(result.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const deleteImage = async (id) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/images/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Image deleted successfully');
        fetchImages();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Image Upload Manager
          </h1>
          <p className="text-gray-600">
            Upload and manage images for your website. Images are automatically optimized.
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Form - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiUpload className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Upload New Image</h2>
                  <p className="text-gray-600 text-sm">Supported: JPG, PNG, WebP (Max 5MB)</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Drag & Drop Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    name="image"
                    id="image"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                  
                  <label htmlFor="image" className="cursor-pointer block">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <FiImage className="text-2xl text-gray-400" />
                    </div>
                    <p className="text-gray-700 mb-2">
                      <span className="text-blue-600 font-medium">Click to browse</span> or drag & drop
                    </p>
                    <p className="text-sm text-gray-500">Max file size: 5MB</p>
                  </label>
                </div>

                {/* Preview */}
                {preview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6"
                  >
                    <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Form Fields */}
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter image title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Optional description"
                      rows="3"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="hero">Hero Images</option>
                        <option value="service">Service Images</option>
                        <option value="product">Product Images</option>
                        <option value="client">Client Images</option>
                        <option value="general">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="hero">Hero Banner</option>
                        <option value="thumbnail">Thumbnail</option>
                        <option value="gallery">Gallery</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Upload Button */}
                <button
                  type="submit"
                  disabled={uploading}
                  className={`w-full mt-6 py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-3 ${
                    uploading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white transition-colors`}
                >
                  {uploading ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Uploading... {progress}%
                    </>
                  ) : (
                    <>
                      <FiUpload />
                      Upload Image
                    </>
                  )}
                </button>

                {/* Progress Bar */}
                {uploading && (
                  <div className="mt-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>

          {/* Instructions & Stats - Right Column */}
          <div className="space-y-8">
            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiCheck className="text-green-500" />
                Upload Guidelines
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCheck className="text-green-600 text-xs" />
                  </div>
                  <span className="text-gray-700 text-sm">
                    Use descriptive titles for better SEO
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCheck className="text-green-600 text-xs" />
                  </div>
                  <span className="text-gray-700 text-sm">
                    Images are automatically optimized for web
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCheck className="text-green-600 text-xs" />
                  </div>
                  <span className="text-gray-700 text-sm">
                    Hero images should be at least 1200x800px
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCheck className="text-green-600 text-xs" />
                  </div>
                  <span className="text-gray-700 text-sm">
                    Use WebP format for best performance
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Image Categories</h3>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div
                    key={cat.value}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg ${cat.color} bg-opacity-50`}
                  >
                    <span className="font-medium">{cat.label}</span>
                    <span className="text-sm opacity-75">
                      {images.filter(img => img.category === cat.value).length} images
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}