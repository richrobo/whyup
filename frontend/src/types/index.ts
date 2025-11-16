export interface User {
  id: number
  email: string
  username: string
  name?: string
  avatar?: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Post {
  id: number
  title: string
  content: string
  summary?: string
  is_published: boolean
  view_count: number
  created_at: string
  updated_at?: string
  author_id: number
  author?: User
}

export interface PostWithAuthor extends Post {
  author: User
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  username: string
  password: string
  confirmPassword: string
  name?: string
}

export interface CreatePostForm {
  title: string
  content: string
  summary?: string
  is_published: boolean
}
