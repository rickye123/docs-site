import React, { useEffect, useState } from "react";
import axios from "axios";
import { marked } from "marked";
import '../global.css';

export const ViewDocumentation = ({ suppliedFilePath }: { suppliedFilePath: string }) => {
  const [content, setContent] = useState<string>("");
  const [markdown, setMarkdown] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [renderedPreview, setRenderedPreview] = useState<string>("");

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        console.log("Fetching content for this:", encodeURIComponent(suppliedFilePath));
        const response = await axios.get(`/dev/pages/${encodeURIComponent(suppliedFilePath)}`);
        const htmlContent = marked(response.data.content);
        setMarkdown(response.data.content);
        setContent(await htmlContent); // Convert to HTML
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };

    fetchMarkdown();
  }, [suppliedFilePath]);

  const handleSave = async () => {
      if (!isValidMarkdown(markdown)) {
          console.error("Invalid Markdown! Fix errors before saving.");
          return;
      }

      const decodedPath = decodeURIComponent(suppliedFilePath);
      console.log("Saving to:", decodedPath);

      try {
          const response = await axios.put(
              `dev/pages/${decodedPath}`,
              { content: markdown }
          );

          console.log("Save Response:", response.data);

          const htmlContent = await marked(markdown);
          setContent(htmlContent);
          setMarkdown(markdown);
          setEditing(false);
      } catch (error) {
          console.error("Error saving content:", error);
      }
  };

  const isValidMarkdown = (input: string) => {
    try {
      marked.lexer(input); // If this fails, the markdown is invalid
      return true;
    } catch (e) {
      console.error("Invalid Markdown:", e);
      return false;
    }
  };

  useEffect(() => {
    const renderMarkdown = async () => {
      if (preview) {
        const html = await marked.parse(markdown);
        setRenderedPreview(html);
      }
    };
    renderMarkdown();
  }, [preview, markdown]);

  const handleDelete = async (filePath: string) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
  
    try {
      await axios.delete("/dev/delete", {
        data: { filePath },
        headers: { "Content-Type": "application/json" }
      });
  
      alert("File deleted successfully!");
      // Optionally refresh the list of files
    } catch (error) {
      console.error('Error Deleting file: ', error);
      alert("Error deleting file");
    }
  };

  return (
    <div className="markdown-container">
      <h2>{suppliedFilePath.replace(".md", "")}</h2>
      {editing ? (
        <div className="editor-preview-container">
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
          />
          <button onClick={() => setPreview(!preview)}>
            {preview ? "Hide Preview" : "Show Preview"}
          </button>
          {preview && (
            <div
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: renderedPreview }}
            />
          )}
        </div>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      )}
      <button onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Edit"}</button>
      {editing && <button onClick={handleSave}>Save</button>}
      <button onClick={() => handleDelete(suppliedFilePath)}>Delete</button>
    </div>
  );
};
export default ViewDocumentation;