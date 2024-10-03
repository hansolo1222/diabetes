import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    })
  }
  prisma = global.prisma

}

// Add this function to test the connection
async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('Successfully connected to the database')
    
    // Perform a simple query to further verify the connection
    const userCount = await prisma.user.count()
    console.log(`Current user count: ${userCount}`)
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    process.exit(1) // Exit the process if unable to connect
  }
}

// Call the function
connectToDatabase()

export default prisma