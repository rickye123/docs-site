import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Documentation from "./pages/Documentation";
import UploadDocumentation from "./pages/UploadDocumentation";
import LandingPage from "./pages/LandingPage";

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/upload" element={<UploadDocumentation />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;