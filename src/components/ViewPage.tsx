import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { marked } from "marked";

export const ViewPage = () => {
  const { filePath = "" } = useParams<{ filePath: string }>();
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        console.log("Fetching content for:", encodeURIComponent(filePath));
        const response = await axios.get(`/dev/pages/${encodeURIComponent(filePath)}`);
        const htmlContent = await marked(response.data.content);
        setContent(htmlContent); // Convert to HTML
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };

    fetchMarkdown();
  }, [filePath]);

  return (
    <div>
      <h2>{filePath.replace(".md", "")}</h2>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};
