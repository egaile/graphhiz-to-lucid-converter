import React, { useState, useEffect } from 'react';
import { Graphviz } from '@hpcc-js/wasm-graphviz';

interface PreviewCanvasProps {
  file: File;
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ file }) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const generatePreview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const content = await file.text();
        const graphviz = await Graphviz.load();
        const svgContent = await graphviz.layout(content, 'svg', 'dot');
        
        if (mounted) {
          setSvg(svgContent);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to generate preview');
          setSvg(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    generatePreview();

    return () => {
      mounted = false;
    };
  }, [file]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
      
      <div className="border rounded-lg bg-gray-50 p-4 min-h-[300px] max-h-[400px] overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {error && (
          <div className="text-red-600 text-sm">
            <p className="font-medium">Preview Error:</p>
            <p className="mt-1">{error}</p>
          </div>
        )}
        
        {svg && !loading && !error && (
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Previewing: {file.name}
      </p>
    </div>
  );
};

export default PreviewCanvas;