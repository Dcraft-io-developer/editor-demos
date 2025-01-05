import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
interface Module {
  id: number;
  name: string;
  description?: string;
}

export const Events = () => {
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/events")
      .then((response) => response.json())
      .then((data) => setModules(data.events));
  }, []);

  return (
    <div className={`container mx-auto p-4 ${" text-white"}`}>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Modules </h2>
        <NavLink
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
          to={"/events/create"}
        >
          Create Module
        </NavLink>
      </div>

      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className={`px-4 py-2 ${"text-white"}`}>ID</th>
            <th className={`px-4 py-2 ${"text-white"}`}>Name</th>
            <th className={`px-4 py-2 ${"text-white"}`}>Description</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(modules).map((module) => (
            <tr
              key={module.id}
              className={`hover:bg-gray-100 ${"hover:bg-gray-700"} `}
            >
              <td className={`border px-4 py-2 ${"text-white"}`}>
                {module.id}
              </td>
              <td className={`border px-4 py-2 ${"text-white"}`}>
                {module.name}
              </td>
              <td className="px-4 py-2 border">
                {module.description || "No description"}
              </td>
              <td className="px-4 py-2 border">
                <Link to={`/events/${module.id}`}>
                  <button className="px-2 py-1 text-white bg-blue-500 rounded">
                    Edit
                  </button>
                </Link>
                <button className="px-2 py-1 ml-2 text-white bg-red-500 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
