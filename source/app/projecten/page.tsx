"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Tag, Calendar, FileText } from 'lucide-react';

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
  document?: {
    filename: string;
    contentType: string;
    data: string;
  };
  projectDate: string;
  author: string;
  tags?: string[];
}

export default function Projecten() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Function to fetch file URL
  const getFileUrl = async (project: Project, type: 'image' | 'document') => {
    try {
      const res = await fetch(`/api/projects/${project._id}/file?type=${type}`);
      if (!res.ok) {
        console.error('Fout bij ophalen bestand');
        return null;
      }
      const fileData = await res.json();
      return `data:${fileData.contentType};base64,${fileData.data}`;
    } catch (err) {
      console.error('Fout bij ophalen bestandsgegevens:', err);
      return null;
    }
  };

  // Modal handlers
  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
  };

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <p className="text-gray-500">Projecten aan het laden...</p>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#1E2A78] mb-8 text-center">Onze Projecten</h1>

        {projects.length === 0 ? (
          <p className="text-center text-gray-500">Momenteel geen projecten beschikbaar.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105"
                onClick={() => openProjectModal(project)}
              >
                {project.image && (
                  <div className="h-48 overflow-hidden">
                    {/* Lazy load image */}
                    <LazyImage 
                      src={`data:${project.image.contentType};base64,${project.image.data}`} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#1E2A78]">{project.title}</h3>
                  <div className="flex items-center text-gray-500 text-sm mt-2">
                    <Calendar size={16} className="mr-2" />
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
                  </div>
                  <p className="text-gray-600 mt-2 line-clamp-3">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeProjectModal}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={closeProjectModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
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

            {/* Project Image */}
            {selectedProject.image && (
              <div className="w-full h-64 md:h-96 overflow-hidden">
                <img 
                  src={`data:${selectedProject.image.contentType};base64,${selectedProject.image.data}`}
                  alt={selectedProject.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Project Details */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-[#1E2A78] mb-4">{selectedProject.title}</h2>
              
              {/* Date and Tags */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-600">
                  <Calendar size={20} className="mr-2" />
                  {selectedProject.projectDate 
                    ? format(
                        isNaN(new Date(selectedProject.projectDate).getTime()) 
                          ? new Date() 
                          : new Date(selectedProject.projectDate), 
                        'd MMMM yyyy', 
                        { locale: nl }
                      )
                    : format(new Date(), 'd MMMM yyyy', { locale: nl })}
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

              {/* Document Download */}
              {selectedProject.document && (
                <div className="mt-6">
                  <a
                    href={`data:${selectedProject.document.contentType};base64,${selectedProject.document.data}`}
                    download={selectedProject.document.filename}
                    className="inline-flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md"
                  >
                    <FileText size={20} className="mr-2" />
                    Download Project Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple lazy image component to improve performance
function LazyImage({ 
  src, 
  alt, 
  className 
}: { 
  src: string, 
  alt: string, 
  className?: string 
}) {
  const [imageSrc, setImageSrc] = useState('/placeholder.png');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-500">Laden...</span>
        </div>
      )}
      <img 
        src={imageSrc} 
        alt={alt} 
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`} 
      />
    </div>
  );
}