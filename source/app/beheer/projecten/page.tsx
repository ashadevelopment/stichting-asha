"use client";

import { useEffect, useState } from 'react';
import { FolderPlus, Trash2, X, File, Image, Pin, PinOff, Edit2, Save, XCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import ConfirmationDialog from '../../../components/ConfirmationDialog';

interface Project {
  _id: string;
  title: string;
  description: string;
  author: string;
  projectDate: string;
  pinned: boolean;
  tags: string[];
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
  createdAt: string;
}

const availableTags = [
  'Gemeenschap',
  'Onderwijs',
  'Cultuur',
  'Politiek',
  'Sport',
  'Zorg',
  'Milieu',
  'Economie',
  'Jeugd',
  'Senioren',
  'Kunst',
  'Evenementen'
];

export default function ProjectenPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pinned, setPinned] = useState(false);
  const [projectDate, setProjectDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    title: string;
    description: string;
    projectDate: string;
    tags: string[];
    pinned: boolean;
  }>({
    title: '',
    description: '',
    projectDate: '',
    tags: [],
    pinned: false
  });

  // Confirmation dialogs
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{
    projectId: string;
    type: 'image' | 'document';
    index?: number;
    filename?: string;
  } | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

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
      setError(err.message || 'Er is een fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPinned(false);
    setProjectDate('');
    setSelectedTags([]);
    setImageFile(null);
    setDocumentFiles([]);
    setError('');
    setSuccessMessage('');
  };

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

    if (documentFiles.length > 3) {
      setError('Maximaal 3 documenten toegestaan');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('projectDate', projectDate);
      formData.append('pinned', pinned.toString());
      formData.append('tags', JSON.stringify(selectedTags));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      documentFiles.forEach((file) => {
        formData.append('documents', file);
      });

      const res = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fout bij opslaan van project');
      }

      const savedProject = await res.json();
      setProjects(prev => [savedProject, ...prev]);
      setSuccessMessage('Project succesvol aangemaakt');
      resetForm();
      setShowForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden');
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project._id);
    setEditData({
      title: project.title,
      description: project.description,
      projectDate: project.projectDate || '',
      tags: project.tags || [],
      pinned: project.pinned
    });
  };

  const handleSaveEdit = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fout bij bijwerken van project');
      }

      const updatedProject = await res.json();
      setProjects(prev => prev.map(p => p._id === projectId ? updatedProject : p));
      setEditingProject(null);
      setSuccessMessage('Project succesvol bijgewerkt');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden');
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditData({
      title: '',
      description: '',
      projectDate: '',
      tags: [],
      pinned: false
    });
  };

  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setIsProjectDialogOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      const res = await fetch(`/api/projects?id=${projectToDelete}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fout bij verwijderen van project');
      }
      
      setProjects(prev => prev.filter(p => p._id !== projectToDelete));
      setSuccessMessage('Project succesvol verwijderd');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error: any) {
      setError(error.message || 'Er is een fout opgetreden');
    } finally {
      setIsProjectDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleDeleteFile = (projectId: string, type: 'image' | 'document', index?: number, filename?: string) => {
    setFileToDelete({ projectId, type, index, filename });
    setIsFileDialogOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    
    try {
      const params = new URLSearchParams({
        type: fileToDelete.type,
        ...(fileToDelete.index !== undefined && { index: fileToDelete.index.toString() })
      });
      
      const res = await fetch(`/api/projects/${fileToDelete.projectId}/file?${params}`, {
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
      
      setSuccessMessage(`${fileToDelete.type === 'image' ? 'Afbeelding' : 'Document'} succesvol verwijderd`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error: any) {
      setError(error.message || 'Er is een fout opgetreden');
    } finally {
      setIsFileDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const handleTogglePin = async (projectId: string, currentPinned: boolean) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/pin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pinned: !currentPinned }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fout bij wijzigen pin status');
      }

      setProjects(prev => prev.map(p => 
        p._id === projectId ? { ...p, pinned: !currentPinned } : p
      ));

      setSuccessMessage(!currentPinned ? 'Project vastgepind' : 'Project losgemaakt');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error: any) {
      setError(error.message || 'Er is een fout opgetreden');
    }
  };

  const handleTagToggle = (tag: string, isEditMode: boolean = false) => {
    if (isEditMode) {
      setEditData(prev => ({
        ...prev,
        tags: prev.tags.includes(tag)
          ? prev.tags.filter(t => t !== tag)
          : [...prev.tags, tag]
      }));
    } else {
      setSelectedTags(prev => 
        prev.includes(tag) 
          ? prev.filter(t => t !== tag)
          : [...prev, tag]
      );
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word') || contentType.includes('document')) return '📝';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊';
    if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '📊';
    return '📁';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: nl });
    } catch {
      return dateString;
    }
  };

  if (!session?.user || !session.user.role || !["beheerder", "developer"].includes(session.user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Toegang geweigerd</h1>
          <p>Je moet ingelogd zijn als beheerder om deze pagina te bekijken.</p>
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

        {/* Messages */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

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
            <h2 className="text-xl font-semibold mb-4">Nieuw Project Toevoegen</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
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

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Beschrijving *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
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

              {/* Pin checkbox */}
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Project vastpinnen</span>
                </label>
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Afbeelding
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Documents Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Documenten (max 3)
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
                  onChange={(e) => setDocumentFiles(Array.from(e.target.files || []))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {documentFiles.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {documentFiles.length} document(en) geselecteerd
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
                <FolderPlus size={20} />
                Project Toevoegen
              </button>
              
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </form>
        )}

        {/* Projects List */}
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">
            Projecten ({projects.length})
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Geen projecten gevonden.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div 
                  key={project._id} 
                  className={`bg-white border rounded-lg p-4 shadow-sm transition hover:shadow-md ${
                    project.pinned ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  {/* Header with actions */}
                  <div className="flex justify-between items-start mb-3">
                    {editingProject === project._id ? (
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                        className="font-semibold text-lg border-b border-gray-300 focus:outline-none focus:border-blue-500 flex-1 mr-2"
                      />
                    ) : (
                      <h3 className="font-semibold text-lg break-words pr-2">{project.title}</h3>
                    )}
                    
                    <div className="flex gap-2 flex-shrink-0">
                      {editingProject === project._id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(project._id)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Opslaan"
                          >
                            <Save size={20} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800 p-1"
                            title="Annuleren"
                          >
                            <XCircle size={20} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditProject(project)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Bewerken"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleTogglePin(project._id, project.pinned)}
                            className={`p-1 rounded ${
                              project.pinned 
                                ? 'text-yellow-600 hover:text-yellow-800' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                            title={project.pinned ? 'Losmaken' : 'Vastpinnen'}
                          >
                            {project.pinned ? <Pin size={20} /> : <PinOff size={20} />}
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Verwijder project"
                          >
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="space-y-2 mb-4">
                    {editingProject === project._id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editData.description}
                          onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                          rows={3}
                        />
                        <input
                          type="date"
                          value={editData.projectDate}
                          onChange={(e) => setEditData(prev => ({ ...prev, projectDate: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editData.pinned}
                            onChange={(e) => setEditData(prev => ({ ...prev, pinned: e.target.checked }))}
                            className="rounded"
                          />
                          <span className="text-sm">Vastpinnen</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">{project.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <span>Door: {project.author}</span>
                          <span>•</span>
                          <span>
                            {project.projectDate ? formatDate(project.projectDate) : formatDate(project.createdAt)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tags */}
                  {editingProject === project._id ? (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Tags</label>
                      <div className="flex flex-wrap gap-1">
                        {availableTags.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag, true)}
                            className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                              editData.tags.includes(tag)
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    project.tags && project.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {project.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}

                  {/* Image */}
                  {project.image && (
                    <div className="mb-4">
                      <div className="relative group">
                        <img
                          src={`data:${project.image.contentType};base64,${project.image.data}`}
                          alt={project.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleDeleteFile(project._id, 'image')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Verwijder afbeelding"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {project.documents && project.documents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">
                        Documenten ({project.documents.length})
                      </h4>
                      <div className="space-y-1">
                        {project.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-lg">{getFileIcon(doc.contentType)}</span>
                              <span className="text-sm truncate">{doc.filename}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteFile(project._id, 'document', index, doc.filename)}
                              className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                              title="Verwijder document"
                            >
                              <X size={16} />
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

        {/* Confirmation Dialogs */}
        <ConfirmationDialog
          isOpen={isProjectDialogOpen}
          onCancel={() => setIsProjectDialogOpen(false)}
          onConfirm={confirmDeleteProject}
          title="Project verwijderen"
          message="Weet je zeker dat je dit project wilt verwijderen? Deze actie kan niet ongedaan gemaakt worden."
        />

        <ConfirmationDialog
          isOpen={isFileDialogOpen}
          onCancel={() => setIsFileDialogOpen(false)}
          onConfirm={confirmDeleteFile}
          title={`${fileToDelete?.type === 'image' ? 'Afbeelding' : 'Document'} verwijderen`}
          message={`Weet je zeker dat je ${fileToDelete?.type === 'image' ? 'deze afbeelding' : 'dit document'} wilt verwijderen?`}
        />
      </div>
    </div>
  );
}