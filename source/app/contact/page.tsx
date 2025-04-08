"use client";

import { useState } from "react";

interface ContactPerson {
  id: string;
  name: string;
  function: string;
  email: string;
  phone_number: string;
  picture_url: string;
}

interface VolunteerForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
}

const defaultContacts: ContactPerson[] = [
  {
    id: "1",
    name: "Radj Ramcharan",
    function: "Secretaris",
    email: "radj@example.com",
    phone_number: "0612345678",
    picture_url: "https://www.stichtingasha.nl/img/radjround2-modified.png",
  },
  {
    id: "2",
    name: "Ronald Kalka",
    function: "Voorzitter",
    email: "ronald@example.com",
    phone_number: "0623456789",
    picture_url: "https://www.stichtingasha.nl/img/ronaldkalkaround1-modified.png",
  },
];

export default function Contact() {
  const [contacts] = useState<ContactPerson[]>(defaultContacts);
  const [form, setForm] = useState<VolunteerForm>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("loading");
    setErrorMessage("");

    try {
      // Assuming you have the supabase logic here for form submission
      // const { error } = await supabase
      //   .from("volunteers")
      //   .insert([
      //     {
      //       first_name: form.firstName,
      //       last_name: form.lastName,
      //       email: form.email,
      //       phone_number: form.phoneNumber,
      //       message: form.message,
      //       status: "pending"
      //     },
      //   ]);

      // For now, we will simulate success response
      setSubmitStatus("success");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setErrorMessage(
        error.message === "duplicate key value violates unique constraint" 
          ? "Dit e-mailadres is al gebruikt voor een aanmelding."
          : "Er is een fout opgetreden bij het versturen van het formulier. Probeer het later opnieuw."
      );
      setSubmitStatus("error");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 bg-[#F2F2F2]">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-[#1E2A78] mb-4">Contactpersonen</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-gray-50 p-4 rounded-lg flex items-center">
              <img
                src={contact.picture_url}
                alt={contact.name}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold text-black">{contact.name}</h3>
                <p className="text-gray-600">Functie: {contact.function}</p>
                <p className="text-gray-600">Telefoonnummer: {contact.phone_number}</p>
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
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-[#1E2A78] mb-4">
          Meld je aan als Vrijwilliger
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-[#1E2A78]">
              Voornaam:
            </label>
            <input
              type="text"
              id="firstName"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
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
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md text-black"
              required
              disabled={submitStatus === "loading"}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[#1E2A78]">
              E-mailadres:
            </label>
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
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
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md text-black"
              rows={4}
              required
              disabled={submitStatus === "loading"}
            />
          </div>

          <button
            type="submit"
            className="bg-[#1E2A78] text-white py-2 px-4 rounded-md hover:bg-[#1E2A78] transition-colors disabled:opacity-50"
            disabled={submitStatus === "loading"}
          >
            {submitStatus === "loading" ? "Bezig met versturen..." : "Verstuur"}
          </button>

          {submitStatus === "success" && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-md">
              <p className="text-green-700">
                Bedankt voor je aanmelding! We nemen zo spoedig mogelijk contact met je op.
              </p>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
              <p className="text-red-700">{errorMessage}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
