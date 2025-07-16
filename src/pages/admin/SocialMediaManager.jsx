import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Share2, Plus, Edit, Trash2, Search, ExternalLink } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const SocialMediaManager = () => {
  const { config, addSocialMedia, updateSocialMedia, deleteSocialMedia, loading } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const filteredSocials = config.socialMediaLinks.filter(social =>
    social.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    social.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSocial = () => {
    setEditingSocial(null);
    reset({
      name: '',
      emoji: '',
      url: '',
      color: '#000000'
    });
    setIsModalOpen(true);
  };

  const handleEditSocial = (social) => {
    setEditingSocial(social);
    reset({
      name: social.name,
      emoji: social.emoji,
      url: social.url,
      color: social.color
    });
    setIsModalOpen(true);
  };

  const handleDeleteSocial = async (socialId) => {
    if (window.confirm('Are you sure you want to delete this social media link?')) {
      await deleteSocialMedia(socialId);
    }
  };

  const onSubmit = async (data) => {
    let result;
    if (editingSocial) {
      result = await updateSocialMedia(editingSocial.id, data);
    } else {
      result = await addSocialMedia(data);
    }

    if (result.success) {
      setIsModalOpen(false);
      reset();
    }
  };

  const platformPresets = [
    { name: 'Instagram', emoji: '📸', color: '#E4405F' },
    { name: 'Facebook', emoji: '📘', color: '#1877F2' },
    { name: 'Twitter', emoji: '🐦', color: '#1DA1F2' },
    { name: 'WhatsApp', emoji: '💬', color: '#25D366' },
    { name: 'YouTube', emoji: '📺', color: '#FF0000' },
    { name: 'TikTok', emoji: '🎵', color: '#000000' },
    { name: 'LinkedIn', emoji: '💼', color: '#0077B5' },
    { name: 'Telegram', emoji: '✈️', color: '#0088CC' }
  ];

  const applyPreset = (preset) => {
    reset({
      name: preset.name,
      emoji: preset.emoji,
      url: '',
      color: preset.color
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Media Manager</h1>
            <p className="text-gray-600">Manage your social media presence and links</p>
          </div>
          <button
            onClick={handleAddSocial}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Social Link
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search social media links..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Social Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSocials.map((social) => (
          <div key={social.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div 
              className="h-20 flex items-center justify-center text-white relative"
              style={{ backgroundColor: social.color }}
            >
              <div className="text-3xl">{social.emoji}</div>
              <div className="absolute top-2 right-2 flex items-center space-x-2">
                <button
                  onClick={() => handleEditSocial(social)}
                  className="p-1 text-white hover:text-gray-200"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteSocial(social.id)}
                  className="p-1 text-white hover:text-gray-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{social.name}</h3>
              <div className="flex items-center justify-between">
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center truncate"
                >
                  <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{social.url}</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSocials.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No social media links found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first social media link.'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddSocial}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Social Link
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingSocial ? 'Edit Social Media Link' : 'Add New Social Media Link'}
              </h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Platform Presets */}
              {!editingSocial && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Select Platform
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {platformPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-center"
                        title={preset.name}
                      >
                        <div className="text-xl">{preset.emoji}</div>
                        <div className="text-xs text-gray-600">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform Name
                </label>
                <input
                  {...register('name', { required: 'Platform name is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter platform name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emoji
                </label>
                <input
                  {...register('emoji', { required: 'Emoji is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter emoji (e.g., 📸)"
                />
                {errors.emoji && (
                  <p className="mt-1 text-sm text-red-600">{errors.emoji.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  {...register('url', { 
                    required: 'URL is required',
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Please enter a valid URL starting with http:// or https://'
                    }
                  })}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/yourprofile"
                />
                {errors.url && (
                  <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    {...register('color', { required: 'Color is required' })}
                    type="color"
                    className="h-10 w-16 border border-gray-300 rounded-md"
                  />
                  <input
                    {...register('color')}
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#000000"
                  />
                </div>
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingSocial ? 'Update' : 'Add')} Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaManager;