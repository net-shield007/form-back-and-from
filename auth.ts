import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {
        // 🔥 FIX: Safely extract values as strings
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) {
          return null
        }

        try {
          const admin = await prisma.admin.findUnique({
            where: { email }
          })

          if (!admin) return null

          // 🔥 FIX: bcrypt now receives real strings
          const isValid = await bcrypt.compare(password, admin.password)
          if (!isValid) return null

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
          }

        } catch (err) {
          console.error("Auth error:", err)
          return null
        }
      }
    })
  ],

  session: {
    strategy: "jwt"
  },

  pages: {
    signIn: "/admin/login"
  },

  // Required for production
  trustHost: true,

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      // 🔥 FIX: Correct session typing
      session.user = {
        ...session.user,
        id: token.id as string
      }
      return session
    }
  },

  secret: process.env.NEXTAUTH_SECRET
})
