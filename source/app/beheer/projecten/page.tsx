"use client";

import { useEffect, useState } from 'react';
import { FolderPlus, FileText, Download, Tag, Calendar, Trash2, ImagePlus, Upload, Pin, PinOff } from 'lucide-react';
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
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(true);

  // New state for tracking deletions
  const [deleteImage, setDeleteImage] = useState(false);
  const [deleteDocument, setDeleteDocument] = useState(false);

  // Confirmation Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

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

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLongDescription('');
    setTags('');
    setProjectDate('');
    setImageFile(null);
    setImagePreview(null);
    setDocumentFile(null);
    setDocumentName('');
    setIsEditing(false);
    setCurrentProject(null);
    // Reset deletion flags
    setDeleteImage(false);
    setDeleteDocument(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setDeleteImage(false); // Reset deletion flag when new file is selected
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      setDocumentName(file.name);
      setDeleteDocument(false); // Reset deletion flag when new file is selected
    }
  };

  // Handle image deletion
  const handleDeleteImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (isEditing && currentProject?.image) {
      setDeleteImage(true); // Mark for deletion
    }
  };

  // Handle document deletion
  const handleDeleteDocument = () => {
    setDocumentFile(null);
    setDocumentName('');
    if (isEditing && currentProject?.document) {
      setDeleteDocument(true); // Mark for deletion
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    let imageData: FileData | undefined | null = undefined;
    let documentData: FileData | undefined | null = undefined;

    // Handle image logic
    if (imageFile) {
      // New image file uploaded
      const bytes = await imageFile.arrayBuffer();
      imageData = {
        filename: imageFile.name,
        contentType: imageFile.type,
        data: Buffer.from(bytes).toString('base64'),
      };
    } else if (deleteImage) {
      // Mark image for deletion
      imageData = null;
    } else if (isEditing && currentProject?.image) {
      // Keep existing image
      imageData = currentProject.image;
    }

    // Handle document logic
    if (documentFile) {
      // New document file uploaded
      const bytes = await documentFile.arrayBuffer();
      documentData = {
        filename: documentFile.name,
        contentType: documentFile.type,
        data: Buffer.from(bytes).toString('base64'),
      };
    } else if (deleteDocument) {
      // Mark document for deletion
      documentData = null;
    } else if (isEditing && currentProject?.document) {
      // Keep existing document
      documentData = currentProject.document;
    }

    // Build project data
    const projectData: any = {
      title,
      description,
      longDescription,
      projectDate: projectDate
        ? new Date(projectDate).toISOString()
        : new Date().toISOString(),
      author: session?.user?.name || 'Onbekend',
      tags: tags.split(',').map((t) => t.trim()),
    };

    // Add image data (including null for deletion)
    if (imageData !== undefined) {
      projectData.image = imageData;
    }

    // Add document data (including null for deletion)
    if (documentData !== undefined) {
      projectData.document = documentData;
    }

    try {
      const url = isEditing && currentProject?._id 
        ? `/api/projects/${currentProject._id}` 
        : '/api/projects';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fout bij opslaan van project');
      }

      const savedProject = await res.json();

      // Update projects list
      if (isEditing) {
        setProjects(projects.map(p => 
          p._id === savedProject._id ? savedProject : p
        ));
        setSuccessMessage('Project succesvol bijgewerkt');
      } else {
        setProjects([savedProject, ...projects]);
        setSuccessMessage('Project succesvol toegevoegd');
      }
      
      // Show success message for 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reset form
      resetForm();
      
      // On mobile, close form after saving
      if (window.innerWidth < 768) {
        setShowForm(false);
      }
    } catch (error: any) {
      console.error('Error saving project:', error);
      setError(error.message || 'Er is een fout opgetreden bij het opslaan van het project');
    }
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setLongDescription(project.longDescription || '');
    setTags(project.tags?.join(', ') || '');
    
    // Convert projectDate to the right format for the date input field (YYYY-MM-DD)
    if (project.projectDate) {
      try {
        const date = new Date(project.projectDate);
        // Check if it's a valid date
        if (!isNaN(date.getTime())) {
          // Convert to YYYY-MM-DD format for HTML date input element
          setProjectDate(date.toISOString().split('T')[0]);
        } else {
          setProjectDate('');
        }
      } catch (error) {
        console.error("Error processing date:", error);
        setProjectDate('');
      }
    } else {
      setProjectDate('');
    }
    
    setIsEditing(true);
    
    // Reset file inputs and deletion flags
    setImageFile(null);
    setImagePreview(null);
    setDocumentFile(null);
    setDocumentName('');
    setDeleteImage(false);
    setDeleteDocument(false);
    
    // If the project has an image, show a preview
    if (project.image && project.image.data) {
      setImagePreview(`data:${project.image.contentType};base64,${project.image.data}`);
    }
    
    // If the project has a document, show the filename
    if (project.document && project.document.filename) {
      setDocumentName(project.document.filename);
    }
    
    // Always show form when editing and scroll to top
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function for deleting a project
  const handleDeleteClick = (projectId: string) => {
    if (!projectId) {
      console.error('Invalid project ID');
      return;
    }
    setProjectToDelete(projectId);
    setIsDialogOpen(true);
  };

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
      
      // Remove project from local state
      setProjects(projects.filter(p => p._id !== projectToDelete));
      
      // Reset form if the deleted project is currently being edited
      if (currentProject?._id === projectToDelete) {
        resetForm();
      }
      
      setSuccessMessage('Project succesvol verwijderd');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsDialogOpen(false);
      setProjectToDelete(null);
    } catch (error: any) {
      console.error('Error deleting project:', error);
      setError(error.message || 'Er is een fout opgetreden bij het verwijderen van het project');
      setIsDialogOpen(false);
    }
  };

  const cancelDelete = () => {
    setIsDialogOpen(false);
    setProjectToDelete(null);
  };

  // Handle pin/unpin functionality
  const handlePinToggle = async (projectId: string) => {
    try {
      const project = projects.find(p => p._id === projectId);
      if (!project) return;

      const currentlyPinned = projects.filter(p => p.pinned).length;
      
      // If trying to pin and already at limit, show error
      if (!project.pinned && currentlyPinned >= 3) {
        setError('Je kunt maximaal 3 projecten vastpinnen');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...project,
          pinned: !project.pinned
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fout bij bijwerken van project');
      }

      const updatedProject = await res.json();
      
      // Update projects list
      setProjects(projects.map(p => 
        p._id === updatedProject._id ? updatedProject : p
      ));
      
      setSuccessMessage(project.pinned ? 'Project losgepind' : 'Project vastgepind');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error toggling pin:', error);
      setError(error.message || 'Er is een fout opgetreden bij het vastpinnen');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Render check for administrators
  if (session?.user?.role !== 'beheerder' && session?.user?.role !== 'developer') {
    return (
      <div className="text-gray-800 p-4">
        <h2 className="text-xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
          <FolderPlus size={24} /> Projecten
        </h2>
        <p className="text-red-500">Je hebt geen toegang tot deze pagina.</p>
      </div>
    );
  }

  // Get pinned count for display
  const pinnedCount = projects.filter(p => p.pinned).length;

  return (
    <div className="text-gray-800 p-4">
      <h2 className="text-xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
        <FolderPlus size={24} /> Projecten
      </h2>

      {/* Pinned Projects Info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <Pin size={16} className="inline mr-1" />
          Vastgepinde projecten: {pinnedCount}/3 
          {pinnedCount > 0 && <span className="ml-2 text-xs">(Deze verschijnen bovenaan op de hoofdpagina)</span>}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-4">
          {successMessage}
        </div>
      )}

      {/* Toggle Form Button - Only visible on small screens */}
      <div className="mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm mb-2"
        >
          <FolderPlus size={18} />
          {showForm ? 'Verberg formulier' : isEditing ? 'Project bewerken' : 'Nieuw project toevoegen'}
        </button>
      </div>

      {/* Project Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 max-w-3xl space-y-4 sm:space-y-6 mb-6 sm:mb-10">
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">
            {isEditing ? 'Project bewerken' : 'Nieuw project toevoegen'}
          </h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Projectnaam</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bijv: Website Redesign"
              className="w-full border border-gray-200 px-3 py-2 rounded text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Beschrijving</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschrijf het project hier..."
              className="w-full border border-gray-200 px-3 py-2 rounded text-sm h-28 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Uitgebreide Beschrijving (Optioneel)</label>
            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              placeholder="Meer details over het project..."
              className="w-full border border-gray-200 px-3 py-2 rounded text-sm h-28 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tags (komma gescheiden)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Bijv: cultuur, festival, gemeenschap"
                className="w-full border border-gray-200 px-3 py-2 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Projectdatum</label>
              <input
                type="date"
                value={projectDate}
                onChange={(e) => setProjectDate(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 rounded text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Afbeelding (Optioneel)</label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded cursor-pointer transition w-fit">
                  <ImagePlus size={18} />
                  <span>Kies een afbeelding</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                
                {(imagePreview || (isEditing && currentProject?.image && !deleteImage)) && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded transition w-fit"
                    title="Verwijder afbeelding"
                  >
                    <Trash2 size={18} />
                    <span>Verwijder</span>
                  </button>
                )}
              </div>
              
              {imagePreview && !deleteImage ? (
                <div className="border border-gray-200 p-2 rounded">
                  <p className="text-xs text-gray-500 mb-2">Voorbeeld:</p>
                  <img 
                    src={imagePreview} 
                    alt="Afbeelding voorbeeld" 
                    className="max-h-48 object-contain rounded" 
                  />
                </div>
              ) : deleteImage ? (
                <div className="border border-red-200 p-2 rounded bg-red-50">
                  <p className="text-xs text-red-600 mb-2">Afbeelding wordt verwijderd bij opslaan</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nog geen afbeelding geselecteerd</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Document (Optioneel)</label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded cursor-pointer transition w-fit">
                  <Upload size={18} />
                  <span>Kies een document</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleDocumentChange}
                    className="hidden"
                  />
                </label>
                
                {(documentName || (isEditing && currentProject?.document && !deleteDocument)) && (
                  <button
                    type="button"
                    onClick={handleDeleteDocument}
                    className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded transition w-fit"
                    title="Verwijder document"
                  >
                    <Trash2 size={18} />
                    <span>Verwijder</span>
                  </button>
                )}
              </div>
              
              {documentName && !deleteDocument ? (
                <div className="flex items-center gap-2 text-sm border border-gray-200 p-2 rounded">
                  <FileText size={18} className="text-blue-600" />
                  <span>{documentName}</span>
                </div>
              ) : deleteDocument ? (
                <div className="border border-red-200 p-2 rounded bg-red-50">
                  <p className="text-xs text-red-600 mb-2">Document wordt verwijderd bij opslaan</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nog geen document geselecteerd</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="submit"
              className="order-2 sm:order-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              {isEditing ? 'Project Bijwerken' : 'Project Toevoegen'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                resetForm();
                if (window.innerWidth < 768) {
                  setShowForm(false);
                }
              }}
              className="order-1 sm:order-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
            >
              {isEditing ? 'Annuleren' : 'Reset'}
            </button>
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
            {projects
              .sort((a, b) => {
                // Sort pinned projects first
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return new Date(b.projectDate).getTime() - new Date(a.projectDate).getTime();
              })
              .map((project) => (
              <div 
                key={project._id} 
                className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition hover:shadow-md ${
                  project.pinned ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                }`}
              >
                {/* Project image thumbnail with responsive aspect ratio */}
                {project.image && (
                  <div className="relative pb-[56.25%] mb-3 overflow-hidden rounded-md">
                    <img 
                      src={`data:${project.image.contentType};base64,${project.image.data}`}
                      alt={project.title} 
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg break-words pr-8">{project.title}</h3>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handlePinToggle(project._id!)}
                      className={`transition-colors ${
                        project.pinned 
                          ? 'text-blue-600 hover:text-blue-800' 
                          : 'text-gray-400 hover:text-blue-600'
                      }`}
                      title={project.pinned ? 'Project lospinnen' : 'Project vastpinnen'}
                    >
                      {project.pinned ? <Pin size={18} /> : <PinOff size={18} />}
                    </button>
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
                
                {project.document && (
                  <a
                    href={`data:${project.document.contentType};base64,${project.document.data}`}
                    download={project.document.filename}
                    className="inline-flex items-center text-sm text-blue-600 hover:underline gap-2 mt-2"
                  >
                    <Download size={14} /> Download Document
                  </a>
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
    </div>
  );
}