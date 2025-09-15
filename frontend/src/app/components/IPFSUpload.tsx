"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Image, Check, AlertCircle } from "lucide-react";
import axios from "axios";

interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}

interface IPFSUploadProps {
  onUploadComplete: (ipfsHash: string) => void;
  onUploadStart?: () => void;
}

export default function IPFSUpload({
  onUploadComplete,
  onUploadStart,
}: IPFSUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return "Please upload only image files (JPEG, PNG, GIF, WebP)";
    }

    if (file.size > maxSize) {
      return "File size must be less than 5MB";
    }

    return null;
  };

  const processFiles = useCallback(async (files: FileList) => {
    setError(null);
    setIsUploading(true);

    // Clear previous files
    setUploadedFiles([]);

    const file = files[0]; // Only process first file for profile picture
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setIsUploading(false);
      return;
    }

    const preview = URL.createObjectURL(file);
    setUploadedFiles([
      {
        file,
        preview,
        id: Math.random().toString(36).substring(7),
      },
    ]);

    setIsUploading(false);
  }, []);

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    onUploadStart?.();

    const formData = new FormData();
    formData.append("file", uploadedFiles[0].file);

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      onUploadComplete(ipfsHash);
    } catch (error) {
      setError("Failed to upload to IPFS. Please try again.");
      console.error("IPFS upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const updated = prev.filter((file) => file.id !== id);
      const fileToRemove = prev.find((file) => file.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`
          relative overflow-hidden cursor-pointer transition-all duration-300 ease-in-out
          border-3 border-dashed rounded-3xl p-8
          ${
            isDragOver
              ? "border-cyan-400 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 scale-105 shadow-2xl shadow-cyan-500/25"
              : "border-purple-400/50 bg-gradient-to-r from-purple-800/30 to-pink-800/30 hover:border-cyan-400/70 hover:from-purple-700/40 hover:to-pink-700/40 hover:scale-102"
          }
          backdrop-blur-sm shadow-xl
        `}
      >
        <div className="relative text-center">
          {isUploading ? (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full animate-pulse shadow-lg shadow-pink-500/50">
                <Upload className="w-8 h-8 text-white animate-bounce" />
              </div>
              <p className="text-cyan-300 font-semibold">
                Uploading your image...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full transition-colors duration-300 ${
                  isDragOver
                    ? "bg-gradient-to-r from-cyan-500 to-pink-500 shadow-lg shadow-pink-500/50"
                    : "bg-gradient-to-r from-purple-600 to-pink-600"
                }`}
              >
                <Upload
                  className={`w-8 h-8 transition-colors duration-300 ${
                    isDragOver ? "text-white" : "text-pink-100"
                  }`}
                />
              </div>

              <div>
                <p className="text-xl font-semibold text-white mb-2">
                  Upload Profile Picture
                </p>
                <p className="text-pink-200 mb-4">
                  Drag & drop or{" "}
                  <span className="text-cyan-300 font-medium hover:text-cyan-200 transition-colors">
                    click to browse
                  </span>
                </p>
                <p className="text-sm text-purple-300/70">
                  Supports: JPEG, PNG, GIF, WebP • Max size: 5MB
                </p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-gradient-to-r from-red-900/40 to-pink-900/40 border border-red-400/50 rounded-2xl backdrop-blur-sm shadow-lg">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Uploaded File Preview */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="group relative bg-gradient-to-br from-purple-800/30 to-pink-800/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl overflow-hidden shadow-xl"
              >
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-purple-900 to-pink-900">
                  <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate mb-1">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-pink-300 text-sm">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFile(uploadedFile.id)}
                      className="ml-3 p-2 text-pink-300 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isUploading ? "Uploading to IPFS..." : "Confirm Profile Picture"}
          </button>
        </div>
      )}
    </div>
  );
}
