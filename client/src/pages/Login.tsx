import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

type LoginData = {
  login: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
};

function Login() {
  const navigate = useNavigate();
  const [login] = useMutation<LoginData>(LOGIN);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await login({
        variables: {
          input: {
            email,
            password,
          },
        },
      });

      if (!data) return;

      localStorage.setItem("token", data.login.token);
      localStorage.setItem("user", JSON.stringify(data.login.user));

      navigate("/dashboard");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-2xl w-96 space-y-5"
      >
        <h1 className="text-3xl font-bold">Welcome back 👋</h1>

        <input
          className="w-full p-3 rounded-lg bg-gray-800"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 rounded-lg bg-gray-800"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold">
          Login
        </button>

        <p className="text-gray-400 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;