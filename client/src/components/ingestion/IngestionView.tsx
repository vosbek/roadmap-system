import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, Check, X, RefreshCw, Building2, Briefcase } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../services/api';
import { enterpriseSystemTemplate, projectTemplate } from './sampleData';

interface FileUploadState {
  id: string;
  name: string;
  status: 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  error?: string;
}

const IngestionView: React.FC = () => {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [activeTab, setActiveTab] = useState<'organization' | 'projects'>('organization');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    const fileId = Math.random().toString(36).substring(7);
    setFiles(prev => [...prev, {
      id: fileId,
      name: file.name,
      status: 'uploading',
      progress: 0
    }]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload to the correct endpoint based on the active tab
      const endpoint = activeTab === 'organization' ? '/api/ingestion/organization' : '/api/ingestion/projects';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'success', progress: 100 }
          : f
      ));

      // Refresh relevant data
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await queryClient.invalidateQueries({ queryKey: ['teams'] });
      await queryClient.invalidateQueries({ queryKey: ['areas'] });
    } catch (error) {
      console.error('Error processing file:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', error: 'Failed to process file' }
          : f
      ));
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      for (const file of e.dataTransfer.files) {
        await processFile(file);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      for (const file of e.target.files) {
        await processFile(file);
      }
    }
  };

  const downloadTemplate = (type: 'organization' | 'projects') => {
    const template = type === 'organization' ? enterpriseSystemTemplate : projectTemplate;
    const fileName = type === 'organization' ? 'organization_structure.csv' : 'project_portfolio.csv';
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Data Ingestion</h1>
              <p className="text-sm text-gray-500 mt-1">Import organizational structure and project data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <nav className="flex -mb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('organization')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'organization'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-5 h-5 inline-block mr-2" />
              Organization Structure
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Briefcase className="w-5 h-5 inline-block mr-2" />
              Project Portfolio
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'organization' ? (
            <>
              {/* Organization Structure Section */}
              <div className="bg-white rounded-lg border p-6 mb-6">
                <div className="flex items-start mb-4">
                  <Building2 className="w-6 h-6 text-gray-400 mr-3" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Organization Structure Import</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Import your organization's complete structure including teams, architects, applications, and capabilities.
                      This should be done before importing projects.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Template Structure:</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">1. Organizations and Areas</p>
                    <p className="text-gray-600">2. Teams and Architects</p>
                    <p className="text-gray-600">3. Applications and Systems</p>
                    <p className="text-gray-600">4. Capabilities</p>
                  </div>
                </div>

                <button 
                  onClick={() => downloadTemplate('organization')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download Organization Template
                </button>
              </div>

              {/* Upload Area for Organization */}
              <div className="bg-white rounded-lg border p-6">
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload Organization Structure
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drop your completed organization template file here
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="org-file-upload"
                  />
                  <label
                    htmlFor="org-file-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    Select File
                  </label>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Project Portfolio Section */}
              <div className="bg-white rounded-lg border p-6 mb-6">
                <div className="flex items-start mb-4">
                  <Briefcase className="w-6 h-6 text-gray-400 mr-3" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Project Portfolio Import</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Import multiple projects at once with their relationships to teams, architects, and systems.
                      Organization structure should be imported first.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Template Structure:</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">1. Project Details (ID, Name, Dates, Type)</p>
                    <p className="text-gray-600">2. Team and Architect Assignments</p>
                    <p className="text-gray-600">3. System Relationships</p>
                    <p className="text-gray-600">4. Dependencies and Subscriptions</p>
                  </div>
                </div>

                <button 
                  onClick={() => downloadTemplate('projects')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download Project Template
                </button>
              </div>

              {/* Upload Area for Projects */}
              <div className="bg-white rounded-lg border p-6">
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload Project Portfolio
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drop your completed project template file here
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="project-file-upload"
                  />
                  <label
                    htmlFor="project-file-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    Select File
                  </label>
                </div>
              </div>
            </>
          )}

          {/* File List - shown for both tabs */}
          {files.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
              <div className="space-y-4">
                {files.map((file) => (
                  <div 
                    key={file.id}
                    className="bg-white border rounded-lg p-4 flex items-center"
                  >
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <div className="mt-1">
                        {file.status === 'uploading' && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        )}
                        {file.status === 'processing' && (
                          <div className="flex items-center text-sm text-amber-600">
                            <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                            Processing...
                          </div>
                        )}
                        {file.status === 'success' && (
                          <div className="flex items-center text-sm text-emerald-600">
                            <Check className="w-4 h-4 mr-1.5" />
                            Processed successfully
                          </div>
                        )}
                        {file.status === 'error' && (
                          <div className="flex items-center text-sm text-red-600">
                            <AlertCircle className="w-4 h-4 mr-1.5" />
                            {file.error || 'Error processing file'}
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
                      className="ml-4 text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IngestionView; 