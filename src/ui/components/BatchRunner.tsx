import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ExportFormat } from '../../App';
import { parseAndLayoutDot } from '../../graph/parseAndLayout';
import { exportToDrawIo } from '../../export/drawio';
import { exportToLucid, createLucidZip } from '../../export/lucid';
import { useConversion } from '../context/ConversionContext';

interface BatchRunnerProps {
  files: File[];
  exportFormat: ExportFormat;
  isProcessing: boolean;
  onProcessingChange: (processing: boolean) => void;
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
}

interface FileStatus {
  name: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  result?: Blob | string;
}

const BatchRunner: React.FC<BatchRunnerProps> = ({
  files,
  exportFormat,
  isProcessing,
  onProcessingChange,
  onRemoveFile,
  onClearAll
}) => {
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const { addResult, clearResults } = useConversion();

  useEffect(() => {
    setFileStatuses(
      files.map(file => ({
        name: file.name,
        status: 'pending'
      }))
    );
  }, [files]);

  const processFile = async (file: File): Promise<{ result?: Blob | string; error?: string }> => {
    try {
      const content = await file.text();
      const graph = await parseAndLayoutDot(content);
      
      if (exportFormat === 'drawio') {
        const xml = exportToDrawIo(graph);
        return { result: xml };
      } else {
        const lucidDoc = exportToLucid(graph);
        const blob = await createLucidZip(lucidDoc);
        return { result: blob };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const handleProcess = async () => {
    onProcessingChange(true);
    clearResults();
    
    const newStatuses = [...fileStatuses];
    
    for (let i = 0; i < files.length; i++) {
      newStatuses[i] = { ...newStatuses[i], status: 'processing' };
      setFileStatuses([...newStatuses]);
      
      const { result, error } = await processFile(files[i]);
      
      if (error) {
        newStatuses[i] = { ...newStatuses[i], status: 'error', error };
        addResult({
          fileName: files[i].name,
          success: false,
          error
        });
      } else {
        newStatuses[i] = { ...newStatuses[i], status: 'success', result };
        addResult({
          fileName: files[i].name,
          success: true,
          data: result
        });
      }
      
      setFileStatuses([...newStatuses]);
    }
    
    onProcessingChange(false);
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    const successfulFiles = fileStatuses.filter(fs => fs.status === 'success' && fs.result);
    
    for (const fileStatus of successfulFiles) {
      const baseName = fileStatus.name.replace(/\.(dot|gv)$/i, '');
      
      if (exportFormat === 'drawio') {
        zip.file(`${baseName}.drawio`, fileStatus.result as string);
      } else {
        zip.file(`${baseName}.lucid`, fileStatus.result as Blob);
      }
    }
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-${exportFormat}-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const successCount = fileStatuses.filter(fs => fs.status === 'success').length;
  const errorCount = fileStatuses.filter(fs => fs.status === 'error').length;
  const canDownload = successCount > 0 && !isProcessing;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Files ({files.length})
          </h3>
          
          <div className="space-x-2">
            <button
              onClick={onClearAll}
              disabled={isProcessing}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              Clear All
            </button>
            
            <button
              onClick={handleProcess}
              disabled={isProcessing || files.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Convert All'}
            </button>
            
            {canDownload && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Download ZIP
              </button>
            )}
          </div>
        </div>
        
        {(successCount > 0 || errorCount > 0) && (
          <div className="mt-2 text-sm">
            <span className="text-green-600">Success: {successCount}</span>
            {errorCount > 0 && (
              <span className="ml-4 text-red-600">Errors: {errorCount}</span>
            )}
          </div>
        )}
      </div>
      
      <div className="divide-y max-h-96 overflow-y-auto">
        {files.map((file, index) => {
          const status = fileStatuses[index] || { name: file.name, status: 'pending' };
          
          return (
            <div key={index} className="px-6 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {status.status === 'pending' && (
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                )}
                {status.status === 'processing' && (
                  <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {status.status === 'success' && (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {status.status === 'error' && (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  {status.error && (
                    <p className="text-xs text-red-600">{status.error}</p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => onRemoveFile(index)}
                disabled={isProcessing}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BatchRunner;