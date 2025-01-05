import { NodeMap } from "flume";
import EventNodeEditor from "../../components/NodeEditor/NodeEditor";
import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";

const EditEvent = () => {
  const [nodes, setNodes] = React.useState<NodeMap>({});
  const [event, setEvent] = React.useState<{
    id: string;
    name: string;
    description: string;
    nodes: NodeMap;
  }>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState();
  const param = useParams();
  const navigate = useNavigate();
  console.log(param);
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/event/${param.id}`)
      .then((response) => response.json())
      .then((data) => data.event)
      .then((data) => {
        if (!data) {
          navigate("/events");
        }
        setLoading(false);
        setNodes(data.nodes);
        setEvent(data);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message);
      });

    return () => {};
  }, [param.id, navigate]);
  return (
    <div className="h-full">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
          <div className="w-24 h-24 border-4 rounded-full border-t-blue-500 border-b-transparent animate-spin"></div>
          <p className="mt-8 text-lg text-gray-500">Loading...</p>
        </div>
      ) : error || !event ? (
        <div className="flex flex-col items-center justify-center min-h-screen text-gray-100">
          <h1 className="font-bold bg-gray-900 text-9xl">500</h1>
          <p className="mb-8 text-2xl font-semibold text-gray-100">
            We have the following error: {error}
          </p>
          <p className="mb-8 text-lg text-gray-500">
            The page you are looking for does not work.
          </p>
          <Link
            to="/"
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      ) : (
        <>
          <EventNodeEditor
            nodes={nodes}
            setNodes={setNodes}
            name={event.name}
            description={event.description}
          ></EventNodeEditor>
        </>
      )}
    </div>
  );
};

export default EditEvent;
