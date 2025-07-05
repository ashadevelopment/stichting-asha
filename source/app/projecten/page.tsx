"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Tag, Calendar, FileText, Pin, Download, File, ChevronDown, ChevronUp } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  longDescription?: string;
  image?: {
    filename: string;
    contentType: string;
    data: string;
  };
  documents?: Array<{
    filename: string;
    contentType: string;
    data: string;
  }>;
  projectDate: string;
  author: string;
  tags?: string[];
  pinned?: boolean;
}

export default function Projecten() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllDocuments, setShowAllDocuments] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/projects');
        
        if (!res.ok) {
          throw new Error('Er is een fout opgetreden bij het ophalen van de projecten');
        }
        
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error('Fout bij ophalen projecten:', err);
        setError('Er is een fout opgetreden bij het ophalen van de projecten');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Sort projects: pinned first, then by date
  const sortedProjects = [...projects].sort((a, b) => {
    // Sort pinned projects first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    // Then sort by date (newest first)
    return new Date(b.projectDate).getTime() - new Date(a.projectDate).getTime();
  });

  // Modal handlers
  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setShowAllDocuments(false); // Reset document view when opening modal
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    setShowAllDocuments(false);
  };

  // Get file icon based on content type
  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word') || contentType.includes('document')) return '📝';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊';
    if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '📈';
    return '📁';
  };

  // Handle individual document download
  const handleDocumentDownload = (e: React.MouseEvent, doc: { filename: string; contentType: string; data: string }) => {
    e.stopPropagation();
    
    const link = document.createElement('a');
    link.href = `data:${doc.contentType};base64,${doc.data}`;
    link.download = doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle download click on card
  const handleCardDownload = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); // Prevent card click from opening modal
    
    if (project.documents && project.documents.length > 0) {
      // Download the first document
      const doc = project.documents[0];
      const link = document.createElement('a');
      link.href = `data:${doc.contentType};base64,${doc.data}`;
      link.download = doc.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F2F2F2] flex items-center justify-center pt-24 md:pt-20">
        <p className="text-gray-500">Projecten aan het laden...</p>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#F2F2F2] flex items-center justify-center pt-24 md:pt-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] py-12 pt-24 md:pt-20">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#1E2A78] mb-8 text-center">Onze Projecten</h1>
        <p className="text-gray-500 text-center mb-8">Klik op een project voor meer informatie!</p>

        {projects.length === 0 ? (
          <p className="text-center text-gray-500">Momenteel geen projecten beschikbaar.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProjects.map((project) => (
              <div
                key={project._id}
                className={`bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105 relative ${
                  project.pinned ? 'ring-2 ring-blue-400 shadow-blue-200' : ''
                }`}
                onClick={() => openProjectModal(project)}
              >
                {/* Pinned indicator */}
                {project.pinned && (
                  <div className="absolute top-2 right-2 z-10 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                    <Pin size={16} />
                  </div>
                )}

                {project.image && project.image.data && (
                  <div className="h-56 overflow-hidden">
                    <img 
                      src={`data:${project.image.contentType};base64,${project.image.data}`} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#1E2A78] break-words min-h-[4rem]">
                    {project.title}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm mt-2">
                    <Calendar size={16} className="mr-2 shrink-0" />
                    <span className="truncate">
                      {project.projectDate 
                        ? format(
                            // Ensure it's a valid date, fallback to current date if invalid
                            isNaN(new Date(project.projectDate).getTime()) 
                              ? new Date() 
                              : new Date(project.projectDate), 
                            'd MMMM yyyy', 
                            { locale: nl }
                          )
                        : format(new Date(), 'd MMMM yyyy', { locale: nl })}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2 line-clamp-3">{project.description}</p>
                  
                  {/* Document indicator and download button */}
                  {project.documents && project.documents.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-gray-500 text-sm">
                          <File size={16} className="mr-2" />
                          <span>
                            {project.documents.length} document{project.documents.length !== 1 ? 'en' : ''}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleCardDownload(e, project)}
                        className="inline-flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-md text-sm transition-colors w-full justify-center"
                        title={`Download ${project.documents[0].filename}`}
                      >
                        <Download size={16} className="mr-2" />
                        Download Document{project.documents.length > 1 ? 's' : ''}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto pt-26"
        onClick={closeProjectModal}
      >
        <div 
          className="bg-white rounded-xl max-w-2xl w-full mx-auto my-auto overflow-y-auto relative flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Close Button - sticky for mobile */}
          <div className="sticky top-0 z-10 bg-white border-b p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1E2A78] break-words pr-8">
                {selectedProject.title}
              </h2>
              {selectedProject.pinned && (
                <div className="bg-blue-600 text-white p-1 rounded-full">
                  <Pin size={14} />
                </div>
              )}
            </div>
            
            {/* Close Button */}
            <button 
              onClick={closeProjectModal}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
              aria-label="Sluiten"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Project Image */}
          {selectedProject.image && selectedProject.image.data && (
            <div className="w-full h-64 md:h-80 overflow-hidden">
              <img 
                src={`data:${selectedProject.image.contentType};base64,${selectedProject.image.data}`}
                alt={selectedProject.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Project Details */}
          <div className="p-4 md:p-6">
            {/* Date and Tags */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div className="flex items-center text-gray-600">
                <Calendar size={20} className="mr-2 shrink-0" />
                <span>
                  {selectedProject.projectDate 
                    ? format(
                        isNaN(new Date(selectedProject.projectDate).getTime()) 
                          ? new Date() 
                          : new Date(selectedProject.projectDate), 
                        'd MMMM yyyy', 
                        { locale: nl }
                      )
                    : format(new Date(), 'd MMMM yyyy', { locale: nl })}
                </span>
              </div>
              
              {selectedProject.tags && selectedProject.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full flex items-center"
                    >
                      <Tag size={12} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Short Description */}
            <p className="text-gray-700 mb-6">{selectedProject.description}</p>

            {/* Long Description */}
            {selectedProject.longDescription && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#1E2A78] mb-2">Meer Details</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedProject.longDescription}
                </p>
              </div>
            )}

            {/* Documents Section */}
            {selectedProject.documents && selectedProject.documents.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#1E2A78] flex items-center gap-2">
                    <FileText size={20} />
                    Project Documenten
                    <span className="text-sm font-normal text-gray-500">
                      ({selectedProject.documents.length})
                    </span>
                  </h3>
                  
                  {selectedProject.documents.length > 2 && (
                    <button
                      onClick={() => setShowAllDocuments(!showAllDocuments)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      {showAllDocuments ? (
                        <>
                          <ChevronUp size={16} />
                          Toon minder
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          Toon alle ({selectedProject.documents.length})
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {selectedProject.documents
                    .slice(0, showAllDocuments ? undefined : 2)
                    .map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl">{getFileIcon(doc.contentType)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {doc.contentType.includes('pdf') ? 'PDF Document' :
                               doc.contentType.includes('word') ? 'Word Document' :
                               doc.contentType.includes('excel') ? 'Excel Spreadsheet' :
                               doc.contentType.includes('powerpoint') ? 'PowerPoint Presentation' :
                               'Document'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDocumentDownload(e, doc)}
                          className="ml-3 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"
                          title={`Download ${doc.filename}`}
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Download All Button for multiple documents */}
                {selectedProject.documents.length > 1 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">
                      Klik op individuele documenten om ze te downloaden
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}