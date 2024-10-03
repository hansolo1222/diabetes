'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function registerUser(email: string, password: string) {
  try {
    console.log('Registration server action called')
    console.log('Received email:', email)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log('User already exists:', email)
      return { error: 'User already exists' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    console.log('User created successfully:', user.id)

    return { message: 'User created successfully' }
  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return { error: 'An error occurred during registration', details: error instanceof Error ? error.message : String(error) }
  }
}