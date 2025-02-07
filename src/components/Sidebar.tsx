import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export const Sidebar = () => {
  const [directories, setDirectories] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentPath, setCurrentPath] = useState<string>(""); // Root starts as empty
  const navigate = useNavigate();

  useEffect(() => {
    fetchContent(""); // Load root directory on mount
  }, []);

  const fetchContent = async (path: string) => {
    setLoading(true);
    try {
      const encodedPath = encodeURIComponent(path);
      console.log('Encoded Path:', encodedPath);
      const response = await axios.get(`/dev/pages${path ? `/${encodedPath}` : ""}`);
      console.log("API Response:", response.data);

      if (response.data.type === "directory") {
        setDirectories(response.data.directories || []);
        setFiles(response.data.files || []);
        setCurrentPath(path);
      } else if (response.data.type === "file") {
        navigate(`/view/${encodeURIComponent(path)}`); // Redirect to markdown viewer
      }
    } catch (err) {
      setError("Error fetching content");
      console.error("Error fetching content:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (item: string, isDirectory: boolean) => {
    const newPath = currentPath ? `${item}` : item;
    const encodedNewPath = encodeURIComponent(newPath);
    console.log("Current Path:", currentPath);
    console.log("Item Path:", item);
    console.log("New Path:", newPath);
    console.log("Encoded New Path:", encodedNewPath);

    if (isDirectory) {
      fetchContent(newPath);
    } else {
      navigate(`/view/${encodedNewPath}`);
    }
  };

  const goBack = () => {
    if (!currentPath) return;
    const pathParts = currentPath.split("/");
    pathParts.pop(); // Remove last segment
    fetchContent(pathParts.join("/"));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <nav className="sidebar">
      <h2>Documentation</h2>
      {currentPath && <button onClick={goBack}>⬅ Go Back</button>}
      <ul>
        {directories.map((dir) => (
          <li key={dir} onClick={() => handleNavigation(dir, true)} style={{ cursor: "pointer", fontWeight: "bold" }}>
            📁 {decodeURIComponent(dir)}
          </li>
        ))}
        {files.map((file) => (
          <li key={file} style={{ cursor: "pointer" }}>
            {/* Use Link here to navigate to ViewPage when a file is clicked */}
            <Link to={`/view/${encodeURIComponent(file)}`} style={{ textDecoration: "none", color: "inherit" }}>
              📄 {decodeURIComponent(file.replace(".md", ""))}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
