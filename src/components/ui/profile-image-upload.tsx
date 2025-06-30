"use client";

import React, { useState } from "react";
import { Upload, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileImageUploadProps {
  // Value and change handlers
  value?: string | null;
  onChange?: (file: File | null) => void;
  onImageUrlChange?: (url: string | null) => void;
  
  // Display options
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  
  // Upload options
  acceptedTypes?: string[];
  maxSizeInMB?: number;
  
  // Styling
  showDeleteOnHover?: boolean;
  placeholder?: React.ReactNode;
  
  // Callbacks
  onError?: (error: string) => void;
  onUploadSuccess?: (file: File, url: string) => void;
  onDelete?: () => void;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24", 
  lg: "w-32 h-32",
  xl: "w-40 h-40"
};

export function ProfileImageUpload({
  value,
  onChange,
  onImageUrlChange,
  size = "lg",
  className,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  maxSizeInMB = 10,
  showDeleteOnHover = true,
  placeholder,
  onError,
  onUploadSuccess,
  onDelete
}: ProfileImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      const error = `File type not supported. Please use: ${acceptedTypes.join(", ")}`;
      onError?.(error);
      return;
    }

    // Validate file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      const error = `File size too large. Maximum size is ${maxSizeInMB}MB`;
      onError?.(error);
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    // Call callbacks
    onChange?.(file);
    onImageUrlChange?.(url);
    onUploadSuccess?.(file, url);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Cleanup object URL
    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
    
    setImageUrl(null);
    onChange?.(null);
    onImageUrlChange?.(null);
    onDelete?.();
    
    // Reset the file input
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Only allow drop if there's no existing image
    if (!imageUrl) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFileUpload(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Only show drag state if there's no existing image
    if (!imageUrl) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Generate unique ID for input
  const inputId = React.useId();

  return (
    <div 
      className={cn(
        "relative rounded-full overflow-hidden border-2 border-dashed transition-colors group",
        sizeClasses[size],
        isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400",
        !imageUrl && "cursor-pointer",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {imageUrl ? (
        <>
          {/* Image Preview */}
          <img
            src={imageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          
          {/* Delete Button Overlay */}
          {showDeleteOnHover && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={handleDelete}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Upload Placeholder */}
          <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center">
            {placeholder || (
              <>
                <User className="w-8 h-8 text-gray-400 mb-2" />
              </>
            )}
          </div>
          
          {/* Upload Overlay on Hover */}
          <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          
          {/* Upload Label - Only when no image */}
          <label htmlFor={inputId} className="absolute inset-0 cursor-pointer">
            <span className="sr-only">Upload profile image</span>
          </label>
        </>
      )}

      {/* Hidden File Input */}
      <input
        id={inputId}
        type="file"
        accept={acceptedTypes.join(",")}
        className="sr-only"
        onChange={handleInputChange}
      />
    </div>
  );
}

// Export a simplified version for common use cases
export function SimpleProfileUpload({
  onImageChange,
  initialImage,
  size = "lg",
  className
}: {
  onImageChange?: (file: File | null, url: string | null) => void;
  initialImage?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  return (
    <ProfileImageUpload
      value={initialImage}
      size={size}
      className={className}
      onChange={(file) => onImageChange?.(file, file ? URL.createObjectURL(file) : null)}
    />
  );
}