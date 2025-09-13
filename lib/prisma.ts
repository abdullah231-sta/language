// Database connection with better error handling
import { PrismaClient } from '@prisma/client'

// Prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function testConnection() {
  try {
    // Test the connection by counting users
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    const userCount = await prisma.user.count()
    console.log(`📊 Current users in database: ${userCount}`)
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

export default prisma