import React from 'react';
import { ExportFormat } from '../../App';

interface OptionsPanelProps {
  exportFormat: ExportFormat;
  onExportFormatChange: (format: ExportFormat) => void;
  disabled?: boolean;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({
  exportFormat,
  onExportFormatChange,
  disabled = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Output Format
          </label>
          
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="drawio"
                checked={exportFormat === 'drawio'}
                onChange={(e) => onExportFormatChange(e.target.value as ExportFormat)}
                disabled={disabled}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">
                <span className="font-medium">draw.io XML</span>
                <span className="text-gray-500 block">
                  Import via draw.io integration in Lucidchart
                </span>
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                value="lucid"
                checked={exportFormat === 'lucid'}
                onChange={(e) => onExportFormatChange(e.target.value as ExportFormat)}
                disabled={disabled}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">
                <span className="font-medium">Lucid Standard Import</span>
                <span className="text-gray-500 block">
                  Direct .lucid format for import
                </span>
              </span>
            </label>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Features</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Preserves node labels and shapes
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Maintains colors and styles
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Supports clusters and subgraphs
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Accurate layout positioning
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OptionsPanel;