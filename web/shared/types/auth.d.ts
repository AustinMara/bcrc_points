// What's stored in the instructor's login cookie (set in server/api/auth/login.post.ts).

declare module '#auth-utils' {
  interface User {
    id: number
    username: string
    name: string | null
  }
}

export {}
