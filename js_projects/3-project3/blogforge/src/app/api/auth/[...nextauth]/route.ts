// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// v4 pattern: create the handler by passing authOptions,
// then export it for both GET and POST.
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }