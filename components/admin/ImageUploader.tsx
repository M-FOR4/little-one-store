"use client";

import { useState } from "react";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";

export function ImageUploader({ 
  onChange 
}: { 
  onChange: (files: File[]) => void 
}) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      const updatedFiles = [...files, ...newFiles];
      const updatedPreviewUrls = [...previewUrls, ...newPreviewUrls];
      
      setFiles(updatedFiles);
      setPreviewUrls(updatedPreviewUrls);
      onChange(updatedFiles);
    }
  };

  const removeImage = (index: number) => {
    const updatedFiles = [...files];
    const updatedPreviewUrls = [...previewUrls];
    
    updatedFiles.splice(index, 1);
    URL.revokeObjectURL(updatedPreviewUrls[index]);
    updatedPreviewUrls.splice(index, 1);
    
    setFiles(updatedFiles);
    setPreviewUrls(updatedPreviewUrls);
    onChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium">اضغط أو اسحب الصور هنا</p>
        <p className="text-sm text-gray-400 mt-2">PNG, JPG حتى 5MB</p>
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50 flex items-center justify-center">
              <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
