"use client"

import { useEffect, useState } from 'react'
import { FolderPlus, FileText, Download } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Project {
  _id?: string
  title: string
  description: string
  image?: string
  document?: string
  author: string
}

export default function ProjectenPage() {
  const { data: session } = useSession()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [projects, setProjects] = useState<Project[]>([])

  // Cloudinary upload functie
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
      method: "POST",
      body: formData,
    })
  
    const data = await res.json()
    console.log("🌩️ Cloudinary response:", data)
  
    if (!res.ok) {
      throw new Error("❌ Cloudinary upload failed")
    }
  
    return data.secure_url as string
  }

  // Fetch bestaande projecten (optioneel)
  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    }
    fetchProjects()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let imageUrl = ''
    let documentUrl = ''

    if (imageFile) {
        console.log("📷 Upload image:", imageFile)
        imageUrl = await uploadToCloudinary(imageFile)
        console.log("✅ Image URL van Cloudinary:", imageUrl)
    }

    if (documentFile) documentUrl = await uploadToCloudinary(documentFile)

    const newProject: Omit<Project, "_id"> = {
      title,
      description,
      image: imageUrl || undefined,
      document: documentUrl || undefined,
      author: session?.user?.name || 'Onbekend',
    }
    console.log("🚀 Verstuurd project:", newProject)

    // Verstuur project naar je database via een API route
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject),
    })

    if (res.ok) {
      const saved = await res.json()
      setProjects([saved, ...projects]) // Nieuw project aan lijst toevoegen
      setTitle('')
      setDescription('')
      setImageFile(null)
      setDocumentFile(null)
    } else {
      console.error("Project niet opgeslagen")
    }
  }

  return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FolderPlus size={24} /> Projecten
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-3xl space-y-6 mb-10"
      >
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
          <label className="block text-sm font-medium mb-1">Afbeelding (Omslag)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Document (optioneel)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
            onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Project toevoegen
        </button>
      </form>

      {/* Lijst van projecten */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Nog geen projecten toegevoegd.</p>
        ) : (
          projects.map((project) => (
            <div
              key={project._id || project.title}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                <FileText size={18} /> {project.title}
              </h3>
              {project.image && (
                <img
                  src={project.image}
                  alt="Project omslag"
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
              )}
              <p className="text-sm text-gray-700 mb-2">{project.description}</p>
              <p className="text-xs text-gray-400 mb-3">Auteur: {project.author}</p>
              {project.document && (
                <a
                  href={project.document}
                  download
                  className="inline-flex items-center text-sm text-blue-600 hover:underline gap-2"
                >
                  <Download size={16} /> Downloaden
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}