"use client";

import { useEffect, useState } from 'react';
import { FolderPlus, FileText, Download, Tag, Calendar, Trash2, ImagePlus, Upload, X, File } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import { Project } from '../../lib/types';

interface FileData {
  filename: string;
  contentType: string;
  data: string;
}

export default function ProjectenPage() {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [tags, setTags] = useState('');
  const [projectDate, setProjectDate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(true);

  // Confirmation Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  // File deletion dialog state
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{
    projectId: string;
    type: 'image' | 'document';
    index?: number;
    filename?: string;
  } | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/projects');
        
        if (!res.ok) {
          throw new Error('Fout bij ophalen van projecten');
        }
        
        const data = await res.json();
        setProjects(data);
      } catch (err: any) {
        console.error('Fout bij ophalen projecten:', err);
        setError(err.message || 'Er is een fout opgetreden');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Reset form function
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLongDescription('');
    setTags('');
    setProjectDate('');
    setImageFile(null);
    setImagePreview(null);
    setDocumentFiles([]);
    setIsEditing(false);
    setCurrentProject(null);
    setError('');
    setSuccessMessage('');
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle document change
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocumentFiles(Array.from(e.target.files));
    }
  };

  // Remove document file
  const removeDocumentFile = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Titel is verplicht');
      return;
    }
    
    if (!description.trim()) {
      setError('Beschrijving is verplicht');
      return;
    }
    
    if (!projectDate) {
      setError('Projectdatum is verplicht');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('longDescription', longDescription.trim());
      formData.append('tags', tags);
      formData.append('projectDate', projectDate);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      documentFiles.forEach((file) => {
        formData.append('documents', file);
      });

      const url = isEditing && currentProject?._id 
        ? `/api/projects/${currentProject._id}`
        : '/api/projects';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fout bij opslaan van project');
      }

      const savedProject = await res.json();
      
      if (isEditing) {
        setProjects(prev => prev.map(p => 
          p._id === savedProject._id ? savedProject : p
        ));
        setSuccessMessage('Project succesvol bijgewerkt');
      } else {
        setProjects(prev => [savedProject, ...prev]);
        setSuccessMessage('Project succesvol aangemaakt');
      }
      
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err: any) {
      console.error('Error saving project:', err);
      setError(err.message || 'Er is een fout opgetreden');
    }
  };

  // Handle edit project
  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setLongDescription(project.longDescription || '');
    setTags(project.tags?.join(', ') || '');
    setProjectDate(project.projectDate.split('T')[0]);
    
    if (project.image) {
      setImagePreview(`data:${project.image.contentType};base64,${project.image.data}`);
    } else {
      setImagePreview(null);
    }
    
    setImageFile(null);
    setDocumentFiles([]);
    setIsEditing(true);
    setShowForm(true);
    setError('');
  };

  // Handle delete click
  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setIsDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      const res = await fetch(`/api/projects/${projectToDelete}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fout bij verwijderen van project');
      }
      
      setProjects(prev => prev.filter(p => p._id !== projectToDelete));
      setSuccessMessage('Project succesvol verwijderd');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      if (currentProject?._id === projectToDelete) {
        resetForm();
      }
      
    } catch (error: any) {
      console.error('Error deleting project:', error);
      setError(error.message || 'Er is een fout opgetreden bij het verwijderen');
    } finally {
      setIsDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setIsDialogOpen(false);
    setProjectToDelete(null);
  };

  // Handle file deletion
  const handleDeleteFile = async (projectId: string, type: 'image' | 'document', index?: number, filename?: string) => {
    setFileToDelete({ projectId, type, index, filename });
    setIsFileDialogOpen(true);
  };

  // Confirm file deletion
  const confirmFileDelete = async () => {
    if (!fileToDelete) return;
    
    try {
      const params = new URLSearchParams({
        type: fileToDelete.type,
        ...(fileToDelete.index !== undefined && { index: fileToDelete.index.toString() })
      });
      
      const res = await fetch(`/api/projects/${fileToDelete.projectId}/files?${params}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fout bij verwijderen van bestand');
      }
      
      // Update projects list
      setProjects(prevProjects => 
        prevProjects.map(project => {
          if (project._id === fileToDelete.projectId) {
            const updatedProject = { ...project };
            
            if (fileToDelete.type === 'image') {
              delete updatedProject.image;
            } else if (fileToDelete.type === 'document' && fileToDelete.index !== undefined) {
              if (updatedProject.documents) {
                updatedProject.documents = updatedProject.documents.filter((_, i) => i !== fileToDelete.index);
                if (updatedProject.documents.length === 0) {
                  delete updatedProject.documents;
                }
              }
            }
            
            return updatedProject;
          }
          return project;
        })
      );
      
      // If we're editing this project, update the form
      if (currentProject?._id === fileToDelete.projectId) {
        if (fileToDelete.type === 'image') {
          setImagePreview(null);
          setImageFile(null);
        }
      }
      
      setSuccessMessage(`${fileToDelete.type === 'image' ? 'Afbeelding' : 'Document'} succesvol verwijderd`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error: any) {
      console.error('Error deleting file:', error);
      setError(error.message || 'Er is een fout opgetreden bij het verwijderen van het bestand');
    } finally {
      setIsFileDialogOpen(false);
      setFileToDelete(null);
    }
  };

  // Cancel file deletion
  const cancelFileDelete = () => {
    setIsFileDialogOpen(false);
    setFileToDelete(null);
  };

  // Get file icon
  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word') || contentType.includes('document')) return '📝';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊';
    if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '📊';
    return '📁';
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Toegang geweigerd</h1>
          <p>Je moet ingelogd zijn om deze pagina te bekijken.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">
            Projecten Beheer
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FolderPlus size={20} />
            {showForm ? 'Verberg Formulier' : 'Nieuw Project'}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Project Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Project Bewerken' : 'Nieuw Project Toevoegen'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Titel *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Project Date */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Projectdatum *
                </label>
                <input
                  type="date"
                  value={projectDate}
                  onChange={(e) => setProjectDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Korte Beschrijving *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Long Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Uitgebreide Beschrijving
                </label>
                <textarea
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  rows={5}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Tags (gescheiden door komma's)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="bijvoorbeeld: web, design, react"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Afbeelding
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {imagePreview && (
                  <div className="mt-2 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-32 h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Documents Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Documenten
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
                  onChange={handleDocumentChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {documentFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {documentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeDocumentFile(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload size={20} />
                {isEditing ? 'Bijwerken' : 'Opslaan'}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuleren
                </button>
              )}
            </div>
          </form>
        )}

        {/* Projects List */}
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Bestaande Projecten</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Geen projecten gevonden.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div 
                  key={project._id} 
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition hover:shadow-md"
                >
                  {/* Project image thumbnail with delete button */}
                  {project.image && (
                    <div className="relative pb-[56.25%] mb-3 overflow-hidden rounded-md group">
                      <img 
                        src={`data:${project.image.contentType};base64,${project.image.data}`}
                        alt={project.title} 
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleDeleteFile(project._id!, 'image', undefined, 'afbeelding')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Verwijder afbeelding"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg break-words pr-8">{project.title}</h3>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Bewerk project"
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(project._id!)}
                        className="text-red-600 hover:text-red-800"
                        title="Verwijder project"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">{project.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Calendar size={14} />
                    <span>
                      {format(new Date(project.projectDate), 'd MMM yyyy', { locale: nl })}
                    </span>
                  </div>
                  
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full flex items-center"
                        >
                          <Tag size={10} className="inline mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Documents display with individual delete buttons */}
                  {project.documents && project.documents.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <File size={14} className="text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {project.documents.length} document{project.documents.length !== 1 ? 'en' : ''}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {project.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between gap-2 text-xs border border-gray-100 p-2 rounded group">
                            <a
                              href={`data:${doc.contentType};base64,${doc.data}`}
                              download={doc.filename}
                              className="flex items-center text-blue-600 hover:underline gap-1 flex-1 min-w-0"
                              title={doc.filename}
                            >
                              <span>{getFileIcon(doc.contentType)}</span>
                              <span className="truncate">{doc.filename}</span>
                            </a>
                            <button
                              onClick={() => handleDeleteFile(project._id!, 'document', index, doc.filename)}
                              className="text-red-500 hover:text-red-700 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Verwijder document"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation Dialog for Deleting Project */}
        <ConfirmationDialog 
          isOpen={isDialogOpen}
          title="Project Verwijderen"
          message="Weet u zeker dat u dit project wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />

        {/* Confirmation Dialog for Deleting Individual Files */}
        <ConfirmationDialog 
          isOpen={isFileDialogOpen}
          title={`${fileToDelete?.type === 'image' ? 'Afbeelding' : 'Document'} Verwijderen`}
          message={`Weet u zeker dat u ${fileToDelete?.filename || (fileToDelete?.type === 'image' ? 'deze afbeelding' : 'dit document')} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
          onConfirm={confirmFileDelete}
          onCancel={cancelFileDelete}
        />
      </div>
    </div>
  );
}