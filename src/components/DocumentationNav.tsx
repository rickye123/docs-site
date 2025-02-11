import React from "react";
import '../global.css';

type DocumentationNavProps = {
  directories: string[];
  files: string[];
  onNavigate: (path: string, isDirectory: boolean) => void;
  goBack: () => void;
  currentPath: string;
};

export const DocumentationNav: React.FC<DocumentationNavProps> = ({ directories, files, onNavigate, goBack, currentPath }) => {
  return (
    <div className="doc-nav">
      {currentPath && <button onClick={goBack}>⬅ Go Back</button>}
      {directories.map((dir) => (
        <div key={dir} className="directory" onClick={() => onNavigate(dir, true)}>
          📁 {dir}
        </div>
      ))}
      {files.map((file) => (
        <div key={file} className="file" onClick={() => onNavigate(file, false)}>
          📄 {file.replace(".md", "")}
        </div>
      ))}
    </div>
  );
};

export default DocumentationNav;