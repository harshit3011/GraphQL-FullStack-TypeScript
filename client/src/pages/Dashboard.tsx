import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      tasks {
        id
        title
        completed
      }
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      id
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      completed
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      completed
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
    }
  }
`;

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

type Project = {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
};

type ProjectsData = {
  projects: Project[];
};

function Dashboard() {
  const { loading, error, data, refetch } = useQuery<ProjectsData>(GET_PROJECTS);

  const [createProject] = useMutation(CREATE_PROJECT);
  const [deleteProject] = useMutation(DELETE_PROJECT);
  const [createTask] = useMutation(CREATE_TASK);
  const [updateTask] = useMutation(UPDATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleCreateProject = async () => {
    if (!projectName) return;

    await createProject({
      variables: {
        input: {
          name: projectName,
          description: projectDescription,
        },
      },
    });

    setProjectName("");
    setProjectDescription("");

    refetch();
  };

  const handleCreateTask = async () => {
    if (!taskTitle || !selectedProject) return;

    await createTask({
      variables: {
        input: {
          projectId: selectedProject,
          title: taskTitle,
        },
      },
    });

    setTaskTitle("");
    refetch();
  };

  const handleToggleTask = async (task: Task) => {
    await updateTask({
      variables: {
        id: task.id,
        input: {
          title: task.title,
          completed: !task.completed,
        },
      },
    });

    refetch();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask({
      variables: { id },
    });

    refetch();
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject({
      variables: { id },
    });

    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-red-400 p-10">
        {error.message}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-8 py-5 flex justify-between">
        <h1 className="text-2xl font-bold">
          GraphQL Project Manager - My mini JIRA
        </h1>

        <div className="flex items-center gap-5">
          <span className="text-gray-400">
            Hey, {user.name}
          </span>

          <button
            onClick={logout}
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-8 space-y-10">

        {/* CREATE PROJECT */}

        <section className="bg-gray-900 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-5">
            Create Project
          </h2>

          <div className="flex gap-3">
            <input
              className="flex-1 bg-gray-800 p-3 rounded-lg"
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <input
              className="flex-1 bg-gray-800 p-3 rounded-lg"
              placeholder="Description"
              value={projectDescription}
              onChange={(e) =>
                setProjectDescription(e.target.value)
              }
            />

            <button
              onClick={handleCreateProject}
              className="bg-blue-600 px-5 rounded-lg"
            >
              Create
            </button>
          </div>
        </section>

        {/* CREATE TASK */}

        <section className="bg-gray-900 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-5">
            Create Task
          </h2>

          <div className="flex gap-3">
            <select
              className="bg-gray-800 p-3 rounded-lg"
              value={selectedProject}
              onChange={(e) =>
                setSelectedProject(e.target.value)
              }
            >
              <option value="">Select project</option>

              {data.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <input
              className="flex-1 bg-gray-800 p-3 rounded-lg"
              placeholder="Task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />

            <button
              onClick={handleCreateTask}
              className="bg-green-600 px-5 rounded-lg"
            >
              Add Task
            </button>
          </div>
        </section>

        {/* PROJECTS */}

        <section>
          <h2 className="text-2xl font-bold mb-5">
            Your Projects
          </h2>

          <div className="grid gap-5">
            {data.projects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-900 p-6 rounded-2xl"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      {project.name}
                    </h3>

                    <p className="text-gray-400 mt-1">
                      {project.description}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleDeleteProject(project.id)
                    }
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-5 space-y-2">
                  {project.tasks.length === 0 && (
                    <p className="text-gray-500">
                      No tasks yet.
                    </p>
                  )}

                  {project.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
                    >
                      <div
                        onClick={() =>
                          handleToggleTask(task)
                        }
                        className="cursor-pointer flex gap-3 items-center"
                      >
                        <span>
                          {task.completed ? "✅" : "⬜"}
                        </span>

                        <span
                          className={
                            task.completed
                              ? "line-through text-gray-500"
                              : ""
                          }
                        >
                          {task.title}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          handleDeleteTask(task.id)
                        }
                        className="text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;