'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, Star, GripVertical, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  label?: string;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  multiple = true,
  label = 'Images',
  maxImages = 6,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    if (images.length + files.length > maxImages) {
      setError('Maximum ' + maxImages + ' images allowed.');
      return;
    }

    setUploading(true);
    setError('');
    const uploaded: string[] = [];

    try {
      for (const file of files) {
        if (file.size > 4 * 1024 * 1024) {
          setError('File "' + file.name + '" exceeds 4MB limit.');
          continue;
        }
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed.');
          continue;
        }
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Upload failed');
        uploaded.push(data.url);
      }
      onChange(multiple ? [...images, ...uploaded] : uploaded.slice(0, 1));
    } catch (err: any) {
      setError(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  // Drag-and-drop from desktop
  const handleDropZone = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      const files = Array.from(e.dataTransfer.files);
      await uploadFiles(files);
    },
    [images]
  );

  // Reorder via drag between thumbnails
  const handleThumbDragStart = (idx: number) => setDragIndex(idx);
  const handleThumbDragEnter = (idx: number) => setDropIndex(idx);
  const handleThumbDragEnd = () => {
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      const next = [...images];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dropIndex, 0, moved);
      onChange(next);
    }
    setDragIndex(null);
    setDropIndex(null);
  };

  const removeImage = (idx: number) => onChange(images.filter((_, i) => i !== idx));
  const setFeatured = (idx: number) => {
    if (idx === 0) return;
    const next = [...images];
    const [img] = next.splice(idx, 1);
    next.unshift(img);
    onChange(next);
  };

  const canAdd = multiple ? images.length < maxImages : images.length === 0;

  return (
    <div>
      <label className="label-field">{label}</label>

      {/* Thumbnails row */}
      {images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <div
              key={img + idx}
              draggable
              onDragStart={() => handleThumbDragStart(idx)}
              onDragEnter={() => handleThumbDragEnter(idx)}
              onDragEnd={handleThumbDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={cn(
                'group relative h-24 w-24 cursor-grab overflow-hidden rounded-2xl border-2 transition-all',
                idx === 0 ? 'border-pink-500 shadow-float' : 'border-pink-100',
                dragIndex === idx && 'opacity-40 scale-95',
                dropIndex === idx && dragIndex !== idx && 'border-pistachio-500 scale-105'
              )}
            >
              <Image src={img} alt={'Image ' + (idx + 1)} fill className="object-cover" />

              {/* Featured badge */}
              {idx === 0 && (
                <div className="absolute left-1 top-1 rounded-full bg-pink-600 px-1.5 py-0.5">
                  <Star className="h-2.5 w-2.5 fill-white text-white" />
                </div>
              )}

              {/* Drag handle */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-4 w-4 text-white drop-shadow" />
              </div>

              {/* Actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-charcoal/0 opacity-0 transition-all group-hover:bg-charcoal/40 group-hover:opacity-100">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => setFeatured(idx)}
                    title="Set as featured"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-600 text-white shadow-sm"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  title="Remove"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-charcoal text-white shadow-sm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canAdd && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDropZone}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-all',
            isDraggingOver
              ? 'border-pink-500 bg-pink-50 scale-[1.01]'
              : 'border-pink-200 bg-pink-50/30 hover:border-pink-400 hover:bg-pink-50'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-pink-500" />
              <p className="text-sm font-medium text-charcoal-600">Uploading...</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100">
                <ImagePlus className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal">
                  {isDraggingOver ? 'Drop to upload' : 'Click or drag images here'}
                </p>
                <p className="mt-0.5 text-xs text-charcoal-600/60">
                  JPG, PNG up to 4MB each · Max {maxImages} images
                </p>
                {images.length > 0 && (
                  <p className="mt-0.5 text-xs text-pink-500 font-medium">
                    First image = featured thumbnail
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => uploadFiles(Array.from(e.target.files ?? []))}
      />

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
          <X className="h-3.5 w-3.5" /> {error}
        </p>
      )}
      {images.length > 0 && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-charcoal-600/60">
          <Upload className="h-3 w-3" />
          Drag thumbnails to reorder · First image is featured
        </p>
      )}
    </div>
  );
}