import React, { useState, useRef } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AvatarUpload = ({ currentAvatar, onAvatarUpdate, className = "" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  // Debug logging
  console.log('🖼️ AvatarUpload component:', {
    currentAvatar,
    userFromContext: user?.avatar,
    fullURL: currentAvatar ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${currentAvatar}` : null
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const uploadAvatar = async (file) => {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn! Vui lòng chọn file dưới 5MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ cho phép upload file ảnh (JPEG, PNG, GIF, WebP)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/users/avatar/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data.success) {
        onAvatarUpdate(response.data.data.avatarUrl);
        alert('Upload avatar thành công!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Upload avatar thất bại!';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteAvatar = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa avatar?')) {
      return;
    }

    try {
      const response = await api.delete('/users/avatar');
      if (response.data.success) {
        onAvatarUpdate(null);
        alert('Xóa avatar thành công!');
      }
    } catch (error) {
      console.error('Delete avatar error:', error);
      const errorMessage = error.response?.data?.message || 'Xóa avatar thất bại!';
      alert(errorMessage);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Avatar Display */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Avatar"
              className="w-full h-full object-cover"
              onLoad={() => console.log('✅ Avatar loaded:', currentAvatar)}
              onError={(e) => {
                console.log('❌ Avatar failed to load:', currentAvatar, 'URL:', e.target.src);
                e.target.src = '/default-avatar.svg';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-2xl font-semibold">
              {user?.firstName?.charAt(0)?.toUpperCase()}{user?.lastName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Overlay with controls - only show on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex gap-2">
            <button
              onClick={triggerFileInput}
              disabled={isUploading}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
              title="Upload ảnh mới"
            >
              {isUploading ? (
                <Upload className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>

            {currentAvatar && (
              <button
                onClick={deleteAvatar}
                disabled={isUploading}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                title="Xóa avatar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
              <div className="text-white text-sm">{uploadProgress}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Instructions */}
      <p className="text-sm text-gray-600 mt-2 text-center">
        Hover để upload/xóa avatar
      </p>
    </div>
  );
};

export default AvatarUpload;