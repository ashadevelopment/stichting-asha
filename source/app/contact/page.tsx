"use client";

import { useState, useEffect } from "react";
import ProfilePictureManager from '../../components/ProfilePictureManager';
import { Send, Upload, FileText, Mail, User } from 'lucide-react';
import EmailContactForm from '../../components/EmailContactForm';

interface ContactPerson {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  function?: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: {
    data: string;
    contentType: string;
  };
  initial?: string;
}

export default function Contact() {
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contact' | 'volunteer'>('contact');
  const [selectedContact, setSelectedContact] = useState<ContactPerson | null>(null);
  const [fileSizeWarning, setFileSizeWarning] = useState<string>("");
  
  // Volunteer form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState('');
  const [motivationFile, setMotivationFile] = useState<File | null>(null);
  const [motivationFileName, setMotivationFileName] = useState('');
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    async function fetchContacts() {
      try {
        const response = await fetch("/api/contacts");
        const data = await response.json();
        setContacts(data.contactPersons || []);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, []);

  // Handle contact person click
  const handleContactClick = (contact: ContactPerson) => {
    setSelectedContact(contact);
  };

  // Close email form
  const closeEmailForm = () => {
    setSelectedContact(null);
  };

  // Helper function to get user's full name
  const getFullName = (contact: ContactPerson) => {
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName} ${contact.lastName}`;
    }
    return contact.name || "Geen naam";
  };

  // Volunteer form handlers
  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileSizeWarning("");
    
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        setFileSizeWarning(`CV bestand is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum is 2MB.`);
        return;
      }
      setCvFile(file);
      setCvFileName(file.name);
    }
  }

  const handleMotivationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileSizeWarning("");
    
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        setFileSizeWarning(`Motivatiebrief is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum is 2MB.`);
        return;
      }
      setMotivationFile(file);
      setMotivationFileName(file.name);
    }
  }

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("loading");
    setErrorMessage("");
  
    // Validate form fields
    if (!firstName || !lastName || !email || !phoneNumber || !message || !cvFile || !motivationFile) {
      setErrorMessage('Alle velden zijn verplicht');
      setSubmitStatus("error");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("phoneNumber", phoneNumber);
      formData.append("message", message);
      
      if (cvFile) {
        formData.append("cv", cvFile);
      }
      
      if (motivationFile) {
        formData.append("motivationLetter", motivationFile);
      }
  
      console.log("Submitting volunteer form data...");
      
      const response = await fetch("/api/volunteers", {
        method: "POST", 
        body: formData,
        // Don't set Content-Type header with FormData
      });
      
      console.log("Response status:", response.status);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || "Er is iets misgegaan bij het versturen");
      }
      
      // Reset form on success
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setMessage('');
      setCvFile(null);
      setCvFileName('');
      setMotivationFile(null);
      setMotivationFileName('');
      setSubmitStatus("success");
      
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setErrorMessage(
        error.message?.includes("duplicate") 
          ? "Dit e-mailadres is al gebruikt voor een aanmelding."
          : error.message || "Er is een fout opgetreden bij het versturen van het formulier. Probeer het later opnieuw."
      );
      setSubmitStatus("error");
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#F2F2F2] pt-28 md:pt-20">
      
      <h1 className="text-3xl font-bold text-[#1E2A78] mb-8 text-center">
        {activeTab === 'contact' ? 'Contact' : 'Vrijwilliger'}
      </h1>
      <div className="container mx-auto py-10 px-4 bg-[#F2F2F2]">
        {/* Tab Navigation */}
        <div className="flex mb-6 shadow-sm border border-gray-200 rounded-lg overflow-hidden bg-white">
          <button
            className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'contact' 
                ? 'bg-[#1E2A78] text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('contact')}
          >
            <Mail size={20} />
            <span className="font-medium">Contact Personen</span>
          </button>
          <button
            className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'volunteer' 
                ? 'bg-[#1E2A78] text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('volunteer')}
          >
            <User size={20} />
            <span className="font-medium">Word Vrijwilliger</span>
          </button>
        </div>

        {/* Contact Persons Tab */}
        {activeTab === 'contact' && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[#1E2A78] mb-4">Contact Personen</h2>
            <p className="text-gray-600 mb-6">
              Klik op een contactpersoon om direct een e-mail te sturen.
            </p>

            {loading ? (
              <div className="flex justify-center p-6">
                <p>Contactpersonen laden...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Geen contact personen gevonden.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contacts.map((contact) => (
                  <div
                  key={contact._id}
                  className="bg-gray-50 p-4 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border border-gray-200 hover:border-blue-300 flex flex-col sm:flex-row sm:items-center gap-4"
                  onClick={() => handleContactClick(contact)}
                >
                  <div className="flex-shrink-0">
                    <ProfilePictureManager
                      userId={contact._id}
                      name={getFullName(contact)}
                      initial={contact.initial}
                      size={64}
                      editable={false}
                      showButtons={false}
                    />
                  </div>
                
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-black">{getFullName(contact)}</h3>
                    {contact.function && (
                      <p className="text-gray-600">Functie: {contact.function}</p>
                    )}
                    <p className="text-gray-600">
                      Telefoonnummer: {contact.phoneNumber || "Geen telefoonnummer"}
                    </p>
                    <p className="text-gray-600">
                      E-mail: <span className="text-blue-500">{contact.email}</span>
                    </p>
                  </div>
                
                  <div className="self-start sm:self-center">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 hover:bg-blue-200">
                      <Mail size={20} />
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Volunteer Tab */}
        {activeTab === 'volunteer' && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[#1E2A78] mb-4">
              Meld je aan als Vrijwilliger
            </h2>
            
            {/* Added volunteer information text */}
            <div className="bg-blue-50 p-5 rounded-lg mb-6 border-l-4 border-blue-500">
              <h3 className="text-xl font-bold text-blue-800 mb-2">TROTS OP HAAR VRIJWILLIGERS</h3>
              <p className="text-gray-700">
                Asha draait volledig op vrijwilligers. Hun inzet is onmisbaar voor alles wat we doen. 
                Als vrijwilliger denk je mee, werk je mee en draag je bij aan de richting van de stichting. 
                Je vergroot je netwerk, leert van anderen en haalt voldoening uit samenwerken. 
                Met zo'n 25 vrijwilligers en jaarlijks 50–60 stagiaires zijn we trots op wat we samen bereiken. 
                Sluit je aan bij een project of loop eens mee — we kunnen altijd extra hulp gebruiken!
              </p>
            </div>

            {submitStatus === "error" && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
                {errorMessage}
              </div>
            )}
            
            {submitStatus === "success" ? (
              <div className="bg-green-50 border border-green-200 p-6 rounded-md text-center space-y-4">
                <h3 className="text-xl font-bold text-green-700">Aanmelding succesvol!</h3>
                <p className="text-gray-600">
                  Bedankt voor je aanmelding als vrijwilliger. We nemen zo snel mogelijk contact met je op.
                </p>
                <button 
                  onClick={() => setSubmitStatus("idle")}
                  className="mt-4 bg-[#1E2A78] text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
                >
                  Nieuw formulier
                </button>
              </div>
            ) : (
              <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-[#1E2A78]">
                      Voornaam:
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-black"
                      required
                      disabled={submitStatus === "loading"}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-[#1E2A78]">
                      Achternaam:
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-black"
                      required
                      disabled={submitStatus === "loading"}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[#1E2A78]">
                    E-mailadres:
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-black"
                    required
                    disabled={submitStatus === "loading"}
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-[#1E2A78]">
                    Telefoonnummer:
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-black"
                    required
                    disabled={submitStatus === "loading"}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-[#1E2A78]">
                    Bericht:
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-black"
                    rows={4}
                    required
                    disabled={submitStatus === "loading"}
                  />
                </div>

                <div>
                  <label className="block text-[#1E2A78]">
                    CV:
                  </label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded cursor-pointer transition w-fit">
                      <Upload size={18} />
                      <span>Kies een CV bestand</span>
                      <input 
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleCvChange}
                        className="hidden"
                        required={!cvFile}
                        disabled={submitStatus === "loading"}
                      />
                    </label>
                    
                    {cvFileName ? (
                      <div className="flex items-center gap-2 text-sm border border-gray-200 p-2 rounded">
                        <FileText size={18} className="text-blue-600" />
                        <span>{cvFileName}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Upload je CV als PDF of Word document</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[#1E2A78]">
                    Motivatiebrief:
                  </label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded cursor-pointer transition w-fit">
                      <Upload size={18} />
                      <span>Kies een motivatiebrief</span>
                      <input 
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleMotivationChange}
                        className="hidden"
                        required={!motivationFile}
                        disabled={submitStatus === "loading"}
                      />
                    </label>
                    
                    {motivationFileName ? (
                      <div className="flex items-center gap-2 text-sm border border-gray-200 p-2 rounded">
                        <FileText size={18} className="text-blue-600" />
                        <span>{motivationFileName}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Upload je motivatiebrief als PDF of Word document</p>
                    )}
                  </div>
                  {fileSizeWarning && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                      {fileSizeWarning}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-[#1E2A78] text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                  disabled={submitStatus === "loading"}
                >
                  <Send size={18} />
                  {submitStatus === "loading" ? "Bezig met versturen..." : "Verstuur aanmelding"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Email form modal */}
        {selectedContact && (
          <EmailContactForm 
            contactPerson={selectedContact} 
            onClose={closeEmailForm} 
          />
        )}
      </div>
    </div>
  );
}