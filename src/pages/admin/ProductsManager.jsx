import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Package, Plus, Edit, Trash2, Search, Upload, X, Play, Image } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const ProductsManager = () => {
  const { config, addProduct, updateProduct, deleteProduct, loading } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // File upload states
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm();

  const variants = watch('variants') || [{ name: '', price: '', size: '' }];

  const filteredProducts = config.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // File upload handlers
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const validImages = files.filter(file => file.type.startsWith('image/'));
    
    if (validImages.length !== files.length) {
      alert('Please select only image files');
      return;
    }

    setSelectedImages(prevImages => [...prevImages, ...validImages]);
    
    // Create previews
    validImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagesPreviews(prevPreviews => [...prevPreviews, {
          file: file,
          url: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    // Check file size (limit to 50MB for demo)
    if (file.size > 50 * 1024 * 1024) {
      alert('Video file size should be less than 50MB');
      return;
    }

    setSelectedVideo(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setVideoPreview({
        file: file,
        url: e.target.result,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    setSelectedImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImagesPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
  };

  const resetFileUploads = () => {
    setSelectedImages([]);
    setSelectedVideo(null);
    setImagesPreviews([]);
    setVideoPreview(null);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    resetFileUploads();
    reset({
      name: '',
      description: '',
      category: config.categories[0]?.name || '',
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
    }

    if (product.video) {
      setVideoPreview({
        url: product.video,
        name: 'existing-video',
        isExisting: true
      });
    }

    reset({
      name: product.name,
      description: product.description,
      category: product.category,
      farm: product.farm || '',
      variants: product.variants,
      popular: product.popular || false
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(productId);
    }
  };

  const onSubmit = async (data) => {
    // Simulate file upload process (in Phase 2, this will upload to Cloudinary)
    const uploadedImages = [];
    const uploadedVideo = null;

    // For demo purposes, we'll use placeholder URLs
    // In Phase 2, replace this with actual Cloudinary upload
    if (selectedImages.length > 0) {
      selectedImages.forEach((file, index) => {
        // Simulate uploaded URL (in Phase 2, this will be the Cloudinary URL)
        uploadedImages.push(`https://images.unsplash.com/photo-${Date.now()}-${index}?w=400&h=400&fit=crop`);
      });
    }

    let videoUrl = null;
    if (selectedVideo) {
      // Simulate video upload (in Phase 2, this will be the Cloudinary video URL)
      videoUrl = `https://sample-videos.com/zip/10/mp4/mp4-${Date.now()}.mp4`;
    }

    // For existing products, keep existing media if no new files uploaded
    const finalImages = uploadedImages.length > 0 ? uploadedImages : 
                       (editingProduct && editingProduct.images) || 
                       ['https://images.unsplash.com/photo-1587736793948-7b6b17f06c8d?w=400&h=400&fit=crop'];

    const finalVideo = videoUrl || (editingProduct && editingProduct.video) || '';

    const productData = {
      ...data,
      image: finalImages[0], // Main image for backward compatibility
      images: finalImages,
      video: finalVideo,
      variants: data.variants.filter(v => v.name && v.price),
      orderLink: 'https://wa.me/33123456789'
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
    }
  };

  const addVariant = () => {
    const currentVariants = variants;
    setValue('variants', [...currentVariants, { name: '', price: '', size: '' }]);
  };

  const removeVariant = (index) => {
    const currentVariants = variants;
    setValue('variants', currentVariants.filter((_, i) => i !== index));
  };

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
              {config.categories.map(category => (
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
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
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
              {/* Media indicators */}
              <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                {product.images && product.images.length > 1 && (
                  <span className="bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Image className="h-3 w-3 mr-1" />
                    {product.images.length}
                  </span>
                )}
                {product.video && (
                  <span className="bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Play className="h-3 w-3 mr-1" />
                    Video
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
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
                  {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
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

      {/* Modal */}
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
                    {config.categories.map(category => (
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
                  {config.farms.map(farm => (
                    <option key={farm.id} value={farm.name}>{farm.name}</option>
                  ))}
                </select>
              </div>

              {/* Media Upload Section */}
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
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </div>
                  </div>
                  
                  {/* Images Preview */}
                  {imagesPreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {imagesPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          {!preview.isExisting && (
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
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
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        MP4, MOV, AVI up to 50MB
                      </p>
                    </div>
                  </div>
                  
                  {/* Video Preview */}
                  {videoPreview && (
                    <div className="mt-4">
                      <div className="relative">
                        <video
                          src={videoPreview.url}
                          className="w-full max-w-md h-40 object-cover rounded-lg"
                          controls
                        />
                        {!videoPreview.isExisting && (
                          <button
                            type="button"
                            onClick={removeVideo}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
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
                  disabled={loading}
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