import React, { useState } from "react";
import { useNavigate } from "react-router";

const NewModuleForm: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    // Create a new module object
    const newModule = {
      name,
      description,
    };

    // Handle form submission (e.g., send to server, add to local state)
    console.log("New Module:", newModule);

    // calling api
    const response = await fetch("http://localhost:3000/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newModule),
    });
    const data = await response.json();
    console.log(data);
    
    setLoading(false);
    if (data.error) {
      setError(data.error);
      return;
    }

    navigate("/events");

    // Clear form fields
    setName("");
    setDescription("");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="mb-4 text-2xl font-bold">Create New Module</h2>

      {error && (
        <p className="p-2 mb-4 text-center text-white bg-red-800 rounded">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="">
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-2 mt-1 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700"
          />
        </div>
        <button
          type="submit"
          className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            loading ? "bg-gray-300" : "bg-blue-500 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? (
            <svg className="w-5 h-5 mr-3 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12c0 4.418 7.814 8 12 8s12-3.582 12-8-7.814-8-12-8-12 3.582-12 8z"
              />
            </svg>
          ) : (
            "Create Module"
          )}
        </button>
      </form>
    </div>
  );
};

export default NewModuleForm;
