import { PrismaClient } from '@prisma/client'
 
const prisma = new PrismaClient()
 
export type GraphQLContext = {
  prisma: PrismaClient
}
 
export function createContext(): GraphQLContext {
  return { prisma }
}


// This will make the prisma object available for us during the execution of our resolvers.
// Now, you’ll need to import the createContext function and make sure you add it as part of the GraphQL execution process in main.ts