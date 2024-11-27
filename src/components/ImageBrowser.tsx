import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Trash2,
  Grid,
  List
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { BackButton } from './common/BackButton';
import { isMobile } from '../utils/device';

interface ImageFile {
  id: string;
  url: string;
  name: string;
  timestamp: number;
}

export const ImageBrowser = () => {
  const { user } = useAuthStore();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .storage
        .from('images')
        .list(`${user?.id}/`, {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (fetchError) throw fetchError;

      const imageFiles: ImageFile[] = await Promise.all(
        data.map(async (file) => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('images')
            .getPublicUrl(`${user?.id}/${file.name}`);

          return {
            id: file.id,
            url: publicUrl,
            name: file.name,
            timestamp: new Date(file.created_at).getTime()
          };
        })
      );

      setImages(imageFiles);
    } catch (err) {
      console.error('Error loading images:', err);
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt ? `.${fileExt}` : ''}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        return {
          id: fileName,
          url: supabase.storage.from('images').getPublicUrl(filePath).data.publicUrl,
          name: fileName,
          timestamp: Date.now()
        };
      });

      const newImages = await Promise.all(uploadPromises);
      setImages(prev => [...newImages, ...prev]);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: ImageFile) => {
    try {
      const { error: deleteError } = await supabase.storage
        .from('images')
        .remove([`${user?.id}/${image.name}`]);

      if (deleteError) throw deleteError;

      setImages(prev => prev.filter(img => img.id !== image.id));
      if (selectedImage?.id === image.id) {
        setSelectedImage(null);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    }
  };

  const openFilePicker = () => {
    if (isMobile()) {
      // On mobile, we'll use the native file picker with capture option
      fileInputRef.current?.click();
    } else {
      // On desktop, we'll use the system file picker
      fileInputRef.current?.click();
    }
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImages(prev => 
      prev.includes(id) 
        ? prev.filter(imgId => imgId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold gradient-text">Image Library</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search images..."
              className="pl-10 w-[300px]"
            />
          </div>
          
          <button
            className="flex items-center justify-center w-8 h-8 bg-secondary rounded-lg hover:bg-secondary-dark transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
            <button
              className={`flex items-center justify-center w-8 h-8 ${viewMode === 'grid' ? 'bg-secondary-dark' : 'bg-transparent'} rounded-lg hover:bg-secondary-dark transition-colors`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              className={`flex items-center justify-center w-8 h-8 ${viewMode === 'list' ? 'bg-secondary-dark' : 'bg-transparent'} rounded-lg hover:bg-secondary-dark transition-colors`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Actions */}
      {selectedImages.length > 0 && (
        <div className="glass mb-6 p-4 rounded-lg flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center w-8 h-8 bg-secondary rounded-lg hover:bg-secondary-dark transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              className="flex items-center justify-center w-8 h-8 bg-secondary rounded-lg hover:bg-secondary-dark transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            <button
              className="flex items-center justify-center w-8 h-8 bg-destructive rounded-lg hover:bg-destructive-dark transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {images.map((image) => (
          <div
            key={image.id}
            className={`glass hover-lift group cursor-pointer ${
              selectedImages.includes(image.id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => toggleImageSelection(image.id)}
          >
            <div className="relative aspect-video">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  className="flex items-center justify-center w-8 h-8 bg-secondary rounded-lg hover:bg-secondary-dark transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  className="flex items-center justify-center w-8 h-8 bg-secondary rounded-lg hover:bg-secondary-dark transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium">{image.name}</h3>
              <p className="text-sm text-muted-foreground">Added {new Date(image.timestamp).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        capture={isMobile() ? "environment" : undefined}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      <button
        className="flex items-center justify-center w-8 h-8 bg-secondary rounded-lg hover:bg-secondary-dark transition-colors absolute top-4 right-4"
        onClick={openFilePicker}
        disabled={uploading}
      >
        {uploading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
        ) : (
          <Upload className="w-5 h-5" />
        )}
      </button>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
    </div>
  );
};
