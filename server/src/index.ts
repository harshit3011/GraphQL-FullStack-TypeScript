import dns from "dns";
import express from "express";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { connectDB } from "./db/connection";
import { Project } from "./model/Project";
import { Task } from "./model/Task";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./model/User";
import { register } from "module";
import { getUserIdFromToken } from "./utils/auth";
import cors from "cors";

dotenv.config({
  path: "../.env",
});

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);


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
    type User {
    id: ID!
    name: String!
    email: String!
    }

    type AuthPayload {
    user: User!
    token: String!
    }

    input CreateProjectInput{
        name: String!
        description: String
    }

    input CreateTaskInput{
      projectId: ID!
      title: String!
    }

    input UpdateProjectInput{
      name: String,
      description: String
    }

    input UpdateTaskInput{
      title: String,
      completed: Boolean
    }
    
    input RegisterInput {
    name: String!
    email: String!
    password: String!
    }

    input LoginInput {
    email: String!
    password: String!
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
        createProject(input: CreateProjectInput!): Project!
        updateProject(id: ID!, input: UpdateProjectInput!): Project!
        deleteProject(id: ID!): Project!
        createTask(input: CreateTaskInput!): Task!
        updateTask(id: ID!, input: UpdateTaskInput!): Task!
        deleteTask(id: ID!): Task!
        register(input: RegisterInput!): AuthPayload!
        login(input: LoginInput!): AuthPayload! 
    }
    
    `,
  resolvers: {
    Query: {
      hello: (_: unknown, __: unknown, context: { userId: string | null }) => {
        if (!context.userId) {
          return "You are not logged in";
        }

        return `You are user ${context.userId}`;
      },
      goodbye: () => "Goodbye from GraphQL!",
      message: () => "This is my first GraphQL project",
      projects: async () => await Project.find(),
      project: async (_: unknown, args: { id: string }) => {
        const project = await Project.findById(args.id);
        return project;
      },
      tasks: async () => await Task.find(),
      task: async (_: unknown, args: { id: string }) => {
        const task = await Task.findById(args.id);
        return task;
      },
    },
    Mutation: {
      createProject: async (
        _: unknown,
        args: {
          input: {
            name: string;
            description: string;
          };
        },
        context: { userId: string | null },
      ) => {
        if (!context.userId) {
          throw new Error("You must be logged in");
        }
        const project = await Project.create({
          name: args.input.name,
          description: args.input.description,
        });
        return project;
      },
      updateProject: async (
        _: unknown,
        args: {
          id: string;
          input: {
            name?: string;
            description?: string;
          };
        },
        context: { userId: string | null },
      ) => {
        if (!context.userId) {
          throw new Error("You must be logged in");
        }

        const project = await Project.findByIdAndUpdate(
          args.id,
          {
            name: args.input.name,
            description: args.input.description,
          },
          { new: true },
        );

        return project;
      },
      deleteProject: async (
        _: unknown,
        args: { id: string },
        context: { userId: string | null },
      ) => {
        if (!context.userId) {
          throw new Error("You must be logged in");
        }

        const project = await Project.findByIdAndDelete(args.id);

        if (project) {
          await Task.deleteMany({
            projectId: project._id,
          });
        }

        return project;
      },
      createTask: async (
        _: unknown,
        args: {
          input: {
            projectId: string;
            title: string;
          };
        },
        context: { userId: string | null },
      ) => {
        if (!context.userId) {
          throw new Error("You must be logged in");
        }

        const task = await Task.create({
          projectId: args.input.projectId,
          title: args.input.title,
        });

        return task;
      },
      updateTask: async (
        _: unknown,
        args: {
          id: string;
          input: {
            title: string;
            completed: boolean;
          };
        },
        context: { userId: string | null },
      ) => {
        if (!context.userId) {
          throw new Error("You must be logged in");
        }

        const task = await Task.findByIdAndUpdate(
          args.id,
          {
            title: args.input.title,
            completed: args.input.completed,
          },
          { new: true },
        );

        return task;
      },
      deleteTask: async (
        _: unknown,
        args: { id: string },
        context: { userId: string | null },
      ) => {
        if (!context.userId) {
          throw new Error("You must be logged in");
        }

        const task = await Task.findByIdAndDelete(args.id);

        return task;
      },

      register: async (
        _: unknown,
        args: {
          input: {
            name: string;
            email: string;
            password: string;
          };
        },
      ) => {
        const { name, email, password } = args.input;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = User.create({
          name,
          email,
          password: hashedPassword,
        });

        const token = jwt.sign(
          { userId: (await user)._id.toString() },
          process.env.JWT_SECRET!,
          { expiresIn: "7d" },
        );
        return {
          user,
          token,
        };
      },
      login: async (
        _: unknown,
        args: {
          input: {
            email: string;
            password: string;
          };
        },
      ) => {
        const { email, password } = args.input;

        const user = await User.findOne({ email });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          throw new Error("Invalid email or password");
        }

        const token = jwt.sign(
          { userId: user._id.toString() },
          process.env.JWT_SECRET!,
          { expiresIn: "7d" },
        );

        return {
          user,
          token,
        };
      },
    },

    Project: {
      id: (project: any) => project._id.toString(),
      tasks: async (project: any) => {
        return await Task.find({
          projectId: project._id,
        });
      },
    },
    Task: {
      id: (task: any) => task._id.toString(),
    },
  },
});

async function startServer() {
  await connectDB();
  await server.start();

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
          console.log("NO AUTH HEADER");
          return { userId: null };
        }

        const token = authHeader.split(" ")[1];

        try {
          const userId = getUserIdFromToken(token);

          return { userId };
        } catch (error) {
          console.log("TOKEN VERIFICATION FAILED:", error);

          return { userId: null };
        }
      },
    }),
  );

  app.listen(PORT, () => {
    console.log(`Server started listening on port ${PORT}`);
  });
}

startServer();
