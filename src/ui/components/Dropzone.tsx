import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const dotFiles = acceptedFiles.filter(file => 
      file.name.endsWith('.dot') || file.name.endsWith('.gv')
    );
    
    if (dotFiles.length > 0) {
      onFilesSelected(dotFiles);
    } else if (acceptedFiles.length > 0) {
      alert('Please select only .dot or .gv files');
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/vnd.graphviz': ['.dot', '.gv'],
      'text/plain': ['.dot', '.gv']
    },
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400 bg-white'
      }`}
    >
      <input {...getInputProps()} />
      
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      <p className="mt-2 text-sm text-gray-600">
        {isDragActive
          ? 'Drop the DOT files here...'
          : 'Drag and drop DOT files here, or click to select'}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Supports .dot and .gv files
      </p>
    </div>
  );
};

export default Dropzone;