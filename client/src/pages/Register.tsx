import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

type RegisterData = {
  register: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
};

function Register() {
  const navigate = useNavigate();
  const [register] = useMutation<RegisterData>(REGISTER);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const { data } = await register({
        variables: { input: { name, email, password } },
      });

      if (!data) return;

      localStorage.setItem("token", data.register.token);
      localStorage.setItem("user", JSON.stringify(data.register.user));
      navigate("/dashboard");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-2xl w-96 space-y-5">
        <h1 className="text-3xl font-bold">Create account 🚀</h1>
        <input className="w-full p-3 rounded-lg bg-gray-800" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <input className="w-full p-3 rounded-lg bg-gray-800" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className="w-full p-3 rounded-lg bg-gray-800" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <button className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold">Register</button>
        <p className="text-gray-400 text-sm">
          Already have an account? <Link to="/login" className="text-blue-400">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;