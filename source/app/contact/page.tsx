"use client";

import { useState, useEffect } from "react";
import Avatar from '../../components/Avatar';
import { Send, Upload, FileText } from 'lucide-react';

interface ContactPerson {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  function: string;
  email: string;
  phoneNumber: string;
  profilePicture?: {
    data: string;
    contentType: string;
  };
  initial: string;
}

export default function Contact() {
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [refreshTrigger] = useState(Date.now());

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

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      setCvFileName(file.name);
    }
  }

  const handleMotivationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMotivationFile(file);
      setMotivationFileName(file.name);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("loading");
    setErrorMessage("");

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
      
      // Updated to use the correct API endpoint
      const response = await fetch("/api/volunteers", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || "Er is iets misgegaan bij het versturen");
      }
      
      const responseData = await response.json();
      
      // Reset form
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
        error.message.includes("duplicate") 
          ? "Dit e-mailadres is al gebruikt voor een aanmelding."
          : error.message || "Er is een fout opgetreden bij het versturen van het formulier. Probeer het later opnieuw."
      );
      setSubmitStatus("error");
    }
  };

  // Helper function to get user's full name
  const getFullName = (contact: ContactPerson) => {
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName} ${contact.lastName}`;
    }
    return contact.name || "Geen naam";
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#F2F2F2]">
      <div className="container mx-auto py-10 px-4 bg-[#F2F2F2]">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-[#1E2A78] mb-4">Contact Personen</h2>

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
              <div key={contact._id} className="bg-gray-50 p-4 rounded-lg flex items-center">
                <Avatar 
                  userId={contact._id}
                  name={getFullName(contact)}
                  initial={contact.initial}
                  size={90}
                  refreshTrigger={refreshTrigger}
                />
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-black">{getFullName(contact)}</h3>
                  {contact.function && (
                    <p className="text-gray-600">Functie: {contact.function}</p>
                  )}
                  <p className="text-gray-600">Telefoonnummer: {contact.phoneNumber || "Geen telefoonnummer"}</p>
                  <p className="text-gray-600">
                    E-mail:{" "}
                    <a href={`mailto:${contact.email}`} className="text-blue-500">
                      {contact.email}
                    </a>
                  </p>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Improved Volunteer Form */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-[#1E2A78] mb-4">
            Meld je aan als Vrijwilliger
          </h2>

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
            <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>
    </div>
  );
}