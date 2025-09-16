import bcrypt from 'bcryptjs'
import { supabase, User } from './supabase'

export interface AuthUser {
  id: string
  email: string
  username: string
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  static async register(email: string, username: string, password: string): Promise<AuthUser> {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    // Check if username is taken
    const { data: existingUsername } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (existingUsername) {
      throw new Error('Username is already taken')
    }

    const passwordHash = await this.hashPassword(password)

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          username,
          password_hash: passwordHash
        }
      ])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: data.id,
      email: data.email,
      username: data.username
    }
  }

  static async login(email: string, password: string): Promise<AuthUser> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      throw new Error('Invalid email or password')
    }

    const isValidPassword = await this.verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username
    }
  }

  static async getUserById(id: string): Promise<AuthUser | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('id', id)
      .single()

    if (error || !user) {
      return null
    }

    return user
  }
}