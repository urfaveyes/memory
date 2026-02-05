import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Home from '../pages/Home';    // Corrected path
import AddItem from '../pages/AddItem';  // Corrected path
import Result from '../pages/Result';  // Corrected path

// App component sets up the routing for the application.
// We use HashRouter because the app runs in an environment where direct URL path manipulation
// is not allowed, but hash string manipulation is.
function App() {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-[calc(100vh-2rem)]"> {/* Adjusted min-h for body padding */}
        {/* Navigation header */}
        <header className="p-4 bg-blue-600 text-white rounded-t-lg shadow-md mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Memory Assistant</h1>
          {/* A simple back button that appears on routes other than home */}
          <Routes>
            <Route path="/" element={null} /> {/* No back button on home */}
            <Route path="*" element={
              <Link to="/" className="text-white text-sm px-3 py-1 bg-blue-700 rounded-md hover:bg-blue-800 transition-colors">
                Home
              </Link>
            } />
          </Routes>
        </header>

        {/* Main content area for routing */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddItem />} />
            {/* The result screen can take an optional item ID or be used for voice assistant */}
            <Route path="/result/:id?" element={<Result />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;