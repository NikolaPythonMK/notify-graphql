import { createServer } from 'http'
import { createSchema, createYoga } from 'graphql-yoga'
import { readFileSync } from 'fs';
import { join } from 'path';
import { resolvers } from './graphql/resolvers';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createContext } from './context';
 
function main() {
  const typeDefs = readFileSync(join(__dirname, './graphql/types.graphql'), 'utf8');

  const schema = makeExecutableSchema({
    resolvers: [resolvers],
    typeDefs: [typeDefs]
  })
  
  const yoga = createYoga({ schema, context: createContext })
  const server = createServer(yoga)
  server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql')
  })
}
 
main()