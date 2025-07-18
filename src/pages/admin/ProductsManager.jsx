// Enhanced ProductsManager.jsx with image deletion functionality

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Package, Plus, Edit, Trash2, Search, Upload, X, Play, Image } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';

const ProductsManager = () => {
  const { config, addProduct, updateProduct, deleteProduct, uploadImages, uploadVideo, deleteMedia, loading } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [videoUploadLoading, setVideoUploadLoading] = useState(false);
  
  // Enhanced file upload states
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  
  // Track images to be deleted (stores publicIds or URLs)
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [videoToDelete, setVideoToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm();

  const variants = watch('variants') || [{ name: '', price: '', size: '' }];

  const filteredProducts = (config?.products || []).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Extract public ID from Cloudinary URL - FIXED for folder structure
  const extractPublicId = (url) => {
    if (!url) return null;
    try {
      // For Cloudinary URLs with folders: extract the full path including folder
      // Example: https://res.cloudinary.com/your-cloud/image/upload/v1234567890/cbd-shop/products/abc123.jpg
      // Should return: cbd-shop/products/abc123
      const matches = url.match(/\/v\d+\/(.+)\.[a-zA-Z]+$/);
      return matches ? matches[1] : null;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  };

  // File upload handlers
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    const validImages = files.filter(file => file.type.startsWith('image/'));
    
    if (validImages.length !== files.length) {
      alert('Please select only image files');
      return;
    }

    if (validImages.length === 0) return;

    setImageUploadLoading(true);
    try {
      const result = await uploadImages(validImages);
      if (result.success) {
        setUploadedImageUrls(prev => [...prev, ...result.images]);
        
        validImages.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = () => {
            setImagesPreviews(prevPreviews => [...prevPreviews, {
              file: file,
              url: result.images[index] || reader.result,
              name: file.name,
              uploaded: true,
              isNew: true
            }]);
          };
          reader.readAsDataURL(file);
        });
      } else {
        alert(result.error || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload images');
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('Video file size should be less than 50MB');
      return;
    }

    setVideoUploadLoading(true);
    try {
      const result = await uploadVideo(file);
      if (result.success) {
        setUploadedVideoUrl(result.videoUrl);
        
        const reader = new FileReader();
        reader.onload = () => {
          setVideoPreview({
            file: file,
            url: result.videoUrl,
            name: file.name,
            uploaded: true,
            isNew: true
          });
        };
        reader.readAsDataURL(file);
      } else {
        alert(result.error || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Video upload error:', error);
      alert('Failed to upload video');
    } finally {
      setVideoUploadLoading(false);
    }
  };

  // Enhanced remove functions that handle deletion
  const removeImage = async (index) => {
    const imagePreview = imagesPreviews[index];
    
    if (imagePreview.isNew) {
      // For newly uploaded images, delete from server immediately
      const publicId = extractPublicId(imagePreview.url);
      if (publicId) {
        try {
          await deleteMedia(publicId, 'image');
        } catch (error) {
          console.error('Failed to delete image from server:', error);
        }
      }
    } else if (imagePreview.isExisting) {
      // For existing images, mark for deletion when saving
      const publicId = extractPublicId(imagePreview.url);
      if (publicId) {
        setImagesToDelete(prev => [...prev, publicId]);
      }
    }
    
    // Remove from previews and URLs
    setImagesPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
    setUploadedImageUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const removeVideo = async () => {
    if (videoPreview?.isNew) {
      // For newly uploaded video, delete from server immediately
      const publicId = extractPublicId(videoPreview.url);
      if (publicId) {
        try {
          await deleteMedia(publicId, 'video');
        } catch (error) {
          console.error('Failed to delete video from server:', error);
        }
      }
    } else if (videoPreview?.isExisting) {
      // For existing video, mark for deletion when saving
      const publicId = extractPublicId(videoPreview.url);
      if (publicId) {
        setVideoToDelete(publicId);
      }
    }
    
    setVideoPreview(null);
    setUploadedVideoUrl('');
  };

  const resetFileUploads = () => {
    setImagesPreviews([]);
    setVideoPreview(null);
    setUploadedImageUrls([]);
    setUploadedVideoUrl('');
    setImagesToDelete([]);
    setVideoToDelete(null);
    setImageUploadLoading(false);
    setVideoUploadLoading(false);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    resetFileUploads();
    reset({
      name: '',
      description: '',
      category: config?.categories?.[0]?.name || '',
      farm: '',
      variants: [{ name: '', price: '', size: '' }],
      popular: false
    });
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    resetFileUploads();
    
    // For editing, show existing images as previews
    if (product.images && product.images.length > 0) {
      const existingPreviews = product.images.map((imageUrl, index) => ({
        url: imageUrl,
        name: `existing-image-${index}`,
        isExisting: true
      }));
      setImagesPreviews(existingPreviews);
      setUploadedImageUrls(product.images);
    } else if (product.image_url || product.image) {
      const imageUrl = product.image_url || product.image;
      setImagesPreviews([{
        url: imageUrl,
        name: 'existing-image',
        isExisting: true
      }]);
      setUploadedImageUrls([imageUrl]);
    }

    if (product.video || product.video_url) {
      const videoUrl = product.video || product.video_url;
      setVideoPreview({
        url: videoUrl,
        name: 'existing-video',
        isExisting: true
      });
      setUploadedVideoUrl(videoUrl);
    }

    reset({
      name: product.name,
      description: product.description,
      category: product.category,
      farm: product.farm || '',
      variants: product.variants || [{ name: '', price: '', size: '' }],
      popular: product.popular || false
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await deleteProduct(productId);
      if (!result.success) {
        alert(result.error || 'Failed to delete product');
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      // Handle media deletion for existing products
      if (editingProduct) {
        // Delete marked images
        for (const publicId of imagesToDelete) {
          try {
            await deleteMedia(publicId, 'image');
          } catch (error) {
            console.error('Failed to delete image:', error);
          }
        }
        
        // Delete marked video
        if (videoToDelete) {
          try {
            await deleteMedia(videoToDelete, 'video');
          } catch (error) {
            console.error('Failed to delete video:', error);
          }
        }
      }

      const finalImages = uploadedImageUrls.length > 0 ? uploadedImageUrls : 
                         (editingProduct && (editingProduct.images || [editingProduct.image_url || editingProduct.image])) || 
                         [];

      const finalVideo = uploadedVideoUrl || 
                        (editingProduct && (editingProduct.video || editingProduct.video_url)) || '';

      const productData = {
        ...data,
        image: finalImages[0] || '',
        images: finalImages,
        video: finalVideo,
        variants: data.variants.filter(v => v.name && v.price),
        orderLink: config?.contactInfo?.orderLink || 'https://wa.me/33123456789'
      };

      let result;
      if (editingProduct) {
        result = await updateProduct(editingProduct.id, productData);
      } else {
        result = await addProduct(productData);
      }

      if (result.success) {
        setIsModalOpen(false);
        reset();
        resetFileUploads();
      } else {
        alert(result.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save product');
    }
  };

  // Rest of the component remains the same...
  const addVariant = () => {
    const currentVariants = variants;
    setValue('variants', [...currentVariants, { name: '', price: '', size: '' }]);
  };

  const removeVariant = (index) => {
    const currentVariants = variants;
    setValue('variants', currentVariants.filter((_, i) => i !== index));
  };

  if (!config) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Manager</h1>
            <p className="text-gray-600">Manage your product catalog with media uploads</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {(config?.categories || []).map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={product.image || product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(event) => {
                  event.target.style.display = 'none';
                  event.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 bg-gray-200 items-center justify-center text-4xl hidden">
                📦
              </div>
              {product.popular && (
                <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  ⭐ Popular
                </div>
              )}
              <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                {product.images && product.images.length > 1 && (
                  <span className="bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Image className="h-3 w-3 mr-1" />
                    {product.images.length}
                  </span>
                )}
                {(product.video || product.video_url) && (
                  <span className="bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Play className="h-3 w-3 mr-1" />
                    Video
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {product.category}
                </span>
                {product.farm && (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    {product.farm}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {product.variants?.length || 0} variant{(product.variants?.length || 0) > 1 ? 's' : ''}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your search or filters.' 
              : 'Get started by adding your first product.'}
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          )}
        </div>
      )}

      {/* Modal with enhanced image management */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    {...register('name', { required: 'Product name is required' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    {(config?.categories || []).map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm (Optional)
                </label>
                <select
                  {...register('farm')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select farm (optional)</option>
                  {(config?.farms || []).map(farm => (
                    <option key={farm.id} value={farm.name}>{farm.name}</option>
                  ))}
                </select>
              </div>

              {/* Enhanced Media Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Product Media</h3>
                
                {/* Images Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-800 font-medium">
                          Click to upload images
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={imageUploadLoading}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                      {imageUploadLoading && (
                        <p className="text-sm text-blue-600 mt-2">Uploading images...</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Enhanced Images Preview with better deletion UI */}
                  {imagesPreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {imagesPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                            {preview.isExisting ? 'Existing' : 'New'}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">{preview.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Video (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      <Play className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-800 font-medium">
                          Click to upload video
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          disabled={videoUploadLoading}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        MP4, MOV, AVI up to 50MB
                      </p>
                      {videoUploadLoading && (
                        <p className="text-sm text-blue-600 mt-2">Uploading video...</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Enhanced Video Preview */}
                  {videoPreview && (
                    <div className="mt-4">
                      <div className="relative group">
                        <video
                          src={videoPreview.url}
                          className="w-full max-w-md h-40 object-cover rounded-lg"
                          controls
                        />
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                          {videoPreview.isExisting ? 'Existing' : 'New'}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{videoPreview.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Variants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Variants
                  </label>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Variant
                  </button>
                </div>
                {variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      {...register(`variants.${index}.name`, { required: 'Variant name is required' })}
                      type="text"
                      placeholder="Name (e.g., 10%)"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      {...register(`variants.${index}.price`, { required: 'Price is required' })}
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex">
                      <input
                        {...register(`variants.${index}.size`)}
                        type="text"
                        placeholder="Size (optional)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="px-2 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center">
                <input
                  {...register('popular')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Mark as popular product
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetFileUploads();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || imageUploadLoading || videoUploadLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingProduct ? 'Update' : 'Add')} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;