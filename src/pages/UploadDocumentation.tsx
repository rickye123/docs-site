import React, { useState } from "react";
import axios from "axios";
import '../global.css';

export const UploadDocumentation: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [folderPath, setFolderPath] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith(".md")) {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Only .md files are allowed");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
  
    try {
      const fileContent = await file.text();
      const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
  
      const payload = {
        fileName: filePath, // Include folder structure
        fileContent: fileContent,
      };
  
      await axios.post("/dev/upload", payload, {
        headers: { "Content-Type": "application/json" }
      });
  
      alert("File uploaded successfully!");
    } catch (error) {
      setError("Error uploading file");
      alert("Error uploading file");
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Markdown File</h2>
      <input type="text" placeholder="Folder path (optional)" value={folderPath} onChange={(e) => setFolderPath(e.target.value)} />
      <input type="file" onChange={handleFileChange} />
      {error && <p className="error-message">{error}</p>}
      <button className="upload-button" onClick={handleUpload} disabled={!file}>Upload</button>
    </div>
  );
};

export default UploadDocumentation;