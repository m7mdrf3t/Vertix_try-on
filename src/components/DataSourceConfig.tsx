import React, { useState } from 'react';
import { FileText, Table, Cloud, Settings } from 'lucide-react';

interface DataSourceConfigProps {
  currentSource: 'google-sheets' | 'excel' | 'csv';
  onSourceChange: (source: 'google-sheets' | 'excel' | 'csv') => void;
}

export const DataSourceConfig: React.FC<DataSourceConfigProps> = ({
  currentSource,
  onSourceChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const dataSources = [
    {
      id: 'google-sheets' as const,
      name: 'Google Sheets',
      description: 'Real-time updates, easy management',
      icon: Cloud,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'excel' as const,
      name: 'Excel File',
      description: 'Local Excel file in assets folder',
      icon: Table,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'csv' as const,
      name: 'CSV File',
      description: 'Local CSV file in assets folder',
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ];

  const currentSourceInfo = dataSources.find(source => source.id === currentSource);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        <Settings className="h-4 w-4" />
        <span>Data Source: {currentSourceInfo?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Choose Data Source</h3>
            <div className="space-y-2">
              {dataSources.map((source) => {
                const Icon = source.icon;
                const isSelected = source.id === currentSource;
                
                return (
                  <button
                    key={source.id}
                    onClick={() => {
                      onSourceChange(source.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${source.bgColor}`}>
                        <Icon className={`h-4 w-4 ${source.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">{source.name}</p>
                          {isSelected && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{source.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {currentSource === 'google-sheets' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Setup required:</strong> Add your Google Sheets URL to environment variables.
                  See <code className="bg-yellow-100 px-1 rounded">GOOGLE_SHEETS_SETUP.md</code> for instructions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
