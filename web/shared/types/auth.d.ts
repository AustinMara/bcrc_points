// What we store in the login cookie (see server/api/auth/login.post.ts).
declare module '#auth-utils' {
  interface User {
    id: number
    username: string
    name: string | null
  }
}

export {}
