import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnect from "../../../lib/mongodb"
import User from "../../../lib/models/User"
import { compare } from "bcryptjs"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Maak verbinding met de database
          await dbConnect()
          
          // Zoek gebruiker (let op: MongoDB is case-sensitive voor email)
          // Converteer email naar lowercase voor consistentie
          const email = credentials?.email.toLowerCase()
          console.log(`Trying to find user with email: ${email}`)
          
          const user = await User.findOne({ email: email })
          console.log(`User found: ${user ? 'Yes' : 'No'}`)
          
          if (!user) {
            console.log("Gebruiker niet gevonden")
            throw new Error("Ongeldige gegevens of gebruiker bestaat niet")
          }

          // Verificatie van wachtwoord
          const isValid = await compare(credentials!.password, user.password)
          console.log(`Password valid: ${isValid ? 'Yes' : 'No'}`)
          
          if (!isValid) {
            console.log("Ongeldig wachtwoord")
            throw new Error("Ongeldige gegevens of gebruiker bestaat niet")
          }

          // Return gebruikersdata voor sessie
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login"
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }