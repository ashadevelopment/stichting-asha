import { useState, useRef } from 'react';
import { X, Send, PaperclipIcon, XCircle } from 'lucide-react';

interface ContactPerson {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  function?: string;
  phoneNumber?: string;
}

interface EmailContactFormProps {
  contactPerson: ContactPerson | null;
  onClose: () => void;
}

export default function EmailContactForm({ contactPerson, onClose }: EmailContactFormProps) {
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getContactPersonName = () => {
    if (contactPerson?.firstName && contactPerson?.lastName) {
      return `${contactPerson.firstName} ${contactPerson.lastName}`;
    }
    return contactPerson?.name || '';
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      setFileName(file.name);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromName || !fromEmail || !subject || !message) {
      setStatus('error');
      setErrorMessage('Vul alle verplichte velden in');
      return;
    }

    // Use FormData to send the email with optional attachment
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('fromName', fromName);
      formData.append('fromEmail', fromEmail);
      formData.append('toEmail', contactPerson?.email || '');
      formData.append('subject', subject);
      formData.append('message', message);
      
      // Add attachment if present
      if (attachment) {
        formData.append('attachment', attachment);
      }
      
      // Send the email using the API route
      const response = await fetch('/api/email', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Er is een fout opgetreden');
      }
      
      // Reset the form after successful submission
      setFromName('');
      setFromEmail('');
      setSubject('');
      setMessage('');
      setAttachment(null);
      setFileName('');
      setStatus('success');
      
      // After 3 seconds, close the form
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error: any) {
      console.error('Email sending error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Er is een fout opgetreden bij het versturen van je e-mail. Probeer het later opnieuw.');
    } finally {
      setSending(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={24} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">E-mail verzonden!</h3>
            <p className="text-gray-600 mt-2">
              Je e-mail naar {getContactPersonName()} is succesvol verzonden.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 relative mt-16 sm:mt-10 md:mt-6 lg:mt-8">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-[#1E2A78] mb-6">
          E-mail naar {getContactPersonName()}
        </h2>

        {status === 'error' && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fromName" className="block text-[#1E2A78] mb-1">
                Je naam:
              </label>
              <input
                type="text"
                id="fromName"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-black"
                required
                disabled={sending}
              />
            </div>
            
            <div>
              <label htmlFor="fromEmail" className="block text-[#1E2A78] mb-1">
                Je e-mailadres:
              </label>
              <input
                type="email"
                id="fromEmail"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-black"
                required
                disabled={sending}
              />
            </div>
          </div>

          <div>
            <label htmlFor="toEmail" className="block text-[#1E2A78] mb-1">
              Aan:
            </label>
            <input
              type="text"
              id="toEmail"
              value={contactPerson?.email || ''}
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md text-black cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-[#1E2A78] mb-1">
              Onderwerp:
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-black"
              required
              disabled={sending}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-[#1E2A78] mb-1">
              Bericht:
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-black"
              rows={6}
              required
              disabled={sending}
            />
          </div>

          <div>
            <label className="block text-[#1E2A78] mb-1">
              Bijlage (optioneel):
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded cursor-pointer transition">
                <PaperclipIcon size={18} />
                <span>Bijlage toevoegen</span>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAttachmentChange}
                  className="hidden"
                  disabled={sending}
                />
              </label>
              
              {fileName && (
                <div className="flex items-center gap-2 text-sm border border-gray-200 p-2 rounded flex-1">
                  <span className="truncate">{fileName}</span>
                  <button 
                    type="button"
                    onClick={removeAttachment}
                    className="text-gray-500 hover:text-red-500"
                    disabled={sending}
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ondersteunde formaten: PDF, Word, Excel, afbeeldingen
            </p>
          </div>

          <div className="flex justify-end mt-6 gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={sending}
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="bg-[#1E2A78] text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={sending}
            >
              <Send size={18} />
              {sending ? "Bezig met versturen..." : "Verstuur e-mail"}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}
