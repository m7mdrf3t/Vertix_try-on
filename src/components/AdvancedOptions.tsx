import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { TryOnParameters } from '../types';

interface AdvancedOptionsProps {
  parameters: TryOnParameters;
  onParametersChange: (parameters: TryOnParameters) => void;
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  parameters,
  onParametersChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateParameter = (key: keyof TryOnParameters, value: any) => {
    onParametersChange({
      ...parameters,
      [key]: value,
    });
  };

  const updateOutputOption = (key: keyof NonNullable<TryOnParameters['outputOptions']>, value: any) => {
    onParametersChange({
      ...parameters,
      outputOptions: {
        ...parameters.outputOptions,
        [key]: value,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Advanced Options
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6 animate-slide-up">
          {/* Basic Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Watermark
              </label>
              <select
                value={parameters.addWatermark?.toString() || ''}
                onChange={(e) => updateParameter('addWatermark', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Default</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Steps
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={parameters.baseSteps || ''}
                onChange={(e) => updateParameter('baseSteps', parseInt(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Default"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Person Generation
              </label>
              <select
                value={parameters.personGeneration || ''}
                onChange={(e) => updateParameter('personGeneration', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Default</option>
                <option value="realistic">Realistic</option>
                <option value="stylized">Stylized</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Safety Setting
              </label>
              <select
                value={parameters.safetySetting || ''}
                onChange={(e) => updateParameter('safetySetting', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Default</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sample Count
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={parameters.sampleCount || ''}
                onChange={(e) => updateParameter('sampleCount', parseInt(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Default"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seed
              </label>
              <input
                type="number"
                value={parameters.seed || ''}
                onChange={(e) => updateParameter('seed', parseInt(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Random"
              />
            </div>
          </div>

          {/* Output Options */}
          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-800 mb-4">Output Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MIME Type
                </label>
                <select
                  value={parameters.outputOptions?.mimeType || ''}
                  onChange={(e) => updateOutputOption('mimeType', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Default</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compression Quality
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={parameters.outputOptions?.compressionQuality || ''}
                  onChange={(e) => updateOutputOption('compressionQuality', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Default"
                />
              </div>
            </div>
          </div>

          {/* Storage URI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Storage URI (Optional)
            </label>
            <input
              type="text"
              value={parameters.storageUri || ''}
              onChange={(e) => updateParameter('storageUri', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="gs://bucket-name/path/to/store/results"
            />
            <p className="text-xs text-gray-500 mt-1">
              Google Cloud Storage URI to store the results
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

