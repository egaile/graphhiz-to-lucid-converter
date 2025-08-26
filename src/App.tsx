import { useState } from 'react';
import Dropzone from './ui/components/Dropzone';
import OptionsPanel from './ui/components/OptionsPanel';
import BatchRunner from './ui/components/BatchRunner';
import PreviewCanvas from './ui/components/PreviewCanvas';
import { ConversionProvider } from './ui/context/ConversionContext';

export type ExportFormat = 'drawio' | 'lucid';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('drawio');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    if (!previewFile && newFiles.length > 0) {
      setPreviewFile(newFiles[0]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = prevFiles.filter((_, i) => i !== index);
      if (previewFile === prevFiles[index]) {
        setPreviewFile(newFiles[0] || null);
      }
      return newFiles;
    });
  };

  const handleClearAll = () => {
    setFiles([]);
    setPreviewFile(null);
  };

  return (
    <ConversionProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Graphviz to Lucidchart Converter
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Convert DOT files to draw.io XML or Lucid Standard Import format
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Dropzone onFilesSelected={handleFilesSelected} />
              
              {files.length > 0 && (
                <BatchRunner
                  files={files}
                  exportFormat={exportFormat}
                  isProcessing={isProcessing}
                  onProcessingChange={setIsProcessing}
                  onRemoveFile={handleRemoveFile}
                  onClearAll={handleClearAll}
                />
              )}
            </div>

            <div className="space-y-6">
              <OptionsPanel
                exportFormat={exportFormat}
                onExportFormatChange={setExportFormat}
                disabled={isProcessing}
              />
              
              {previewFile && (
                <PreviewCanvas file={previewFile} />
              )}
            </div>
          </div>
        </main>

        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              Privacy-first converter - All processing happens locally in your browser
            </p>
          </div>
        </footer>
      </div>
    </ConversionProvider>
  );
}

export default App;