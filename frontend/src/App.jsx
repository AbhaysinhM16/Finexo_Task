import React, { useState, useEffect } from 'react';
import './App.css';  
import FileImportPage from './components/ImportPage';  
import LoadingAnimation from './components/LoadingAnimation';  

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay of 6 seconds for polished experience
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {isLoading ? (
        <LoadingAnimation />  // Show the loading screen until data is loaded
      ) : (
        <div className="transition-all duration-700 ease-in-out opacity-100">
          <FileImportPage /> 
        </div>
      )}
    </div>
  );
}

export default App;
