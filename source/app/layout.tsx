import type { Metadata } from "next";
import { Roboto, Poppins } from "next/font/google";
import "./globals.css";
import { SessionWrapper } from "../components/SessionWrapper";
import { Header } from "../components/Header";

const RobotoFont = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});
const PoppinsFont = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stichting Asha",
  description: "Stichting Asha (Asha = Hoop in het hindi) is een vrijwilligersorganisatie van Surinaamse Hindostanen in de gemeente Utrecht. De organisatie is in 1976 opgericht en wil met haar activiteiten een positieve bijdrage leveren aan het gemeentelijke integratie- en participatiebeleid.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${RobotoFont.variable} ${PoppinsFont.variable} antialiased`}>
        <SessionWrapper>
          <Header  className="relative w-full shadow-md z-50" />
          <main className="p-0">{children}</main>
    
        </SessionWrapper>
      </body>
    </html>
  );
}