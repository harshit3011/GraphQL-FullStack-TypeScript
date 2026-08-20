import dns from "dns";
import express from "express";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { connectDB } from "./db/connection";
import { Project } from "./model/Project";
import { Task } from "./model/Task";

dotenv.config({
  path: "../.env",
});

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const app = express();
const PORT = process.env.PORT;



const server = new ApolloServer({
  typeDefs: `#graphql
    type Project {
    id: ID!
    name: String!
    description: String
    tasks: [Task!]!
    }
    type Task {
    id: ID!
    title: String!
    completed: Boolean!
    }

    type Query{
        hello: String
        goodbye: String
        message: String
        projects: [Project!]!
        project(id: ID!): Project
        tasks : [Task!]!
        task(id: ID!): Task
    }

    type Mutation{
        createProject(name: String!, description: String!): Project!
        createTask(projectId: ID!,title: String!): Task!
    }
    
    `,
  resolvers: {
    Query: {
      hello: () => "Hello from GraphQL!",
      goodbye: () => "Goodbye from GraphQL!",
      message: () => "This is my first GraphQL project",
      projects: async()=> await Project.find(),
      project : async (_:unknown, args:{id:string})=>{
         const project= await Project.findById(args.id)
         return project
      },
      tasks: async()=>await Task.find(),
      task: async (_:unknown,args:{id:string})=>{
        const task= await Task.findById(args.id)
        return task
      }
    },
    Mutation : {
        createProject : async (_:unknown, args: {name: string, description: string})=>{
           const project= await Project.create({
            name : args.name,
            description: args.description
        })
        return project
        },
        createTask : async (_: unknown,args:{projectId: string, title:string})=>{
            const task = await Task.create({
                projectId: args.projectId,
                title: args.title
            })
            return task
        }
    },
    Project: {
        id: (project: any) => project._id.toString(),
        tasks: async (project: any) => {
        return await Task.find({
            projectId: project._id
        });
    }
    },
    Task: {
    id: (task: any) => task._id.toString()
}
  },
});

async function startServer() {
  
  await connectDB()  
  await server.start();

  app.use("/graphql", express.json(), expressMiddleware(server));

  app.listen(PORT, () => {
    console.log(`Server started listening on port ${PORT}`);
  });
}

startServer();
