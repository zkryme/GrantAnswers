import React from 'react';
import ProjectTable from './ProjectTable';
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <div className="App">
      <ProjectTable />
      <Analytics /> {/* This ensures Vercel Analytics is enabled */}
    </div>
  );
}

export default App;
