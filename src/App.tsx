import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { ViewPage } from "./components/ViewPage";

const App = () => {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/view/:filePath" element={<ViewPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
