import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DocumentationNav from "../components/DocumentationNav";
import ViewDocumentation from "../components/ViewDocumentation";
import '../global.css';

export const Documentation = () => {
  const [directories, setDirectories] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentPath, setCurrentPath] = useState<string>(""); // Root starts as empty
  const [fileSelected, setFileSelected] = useState<string>();
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
        setFileSelected(undefined);
      } else if (response.data.type === "file") {
        setFileSelected(encodeURIComponent(path));
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
      setFileSelected(encodedNewPath);
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
    <>
      <DocumentationNav directories={directories} files={files} onNavigate={handleNavigation} goBack={goBack} currentPath={currentPath}/>
      {fileSelected && <ViewDocumentation suppliedFilePath={fileSelected} />}
    </>
  );
};

export default Documentation;