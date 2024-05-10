import React, { useState, useEffect } from 'react';

function ArtStylesComponent({ setPrompt }) {
  const defaultPrompt = 'angular colorful cubist picasso painting';
  const [inputValue, setInputValue] = useState(defaultPrompt);
  const [isVisible, setIsVisible] = useState(true);
  let mouseMovementTimeout;

  useEffect(() => {
    // Automatically set the default prompt as active when the component mounts
    setPrompt.current = defaultPrompt;

    const handleMouseMovement = () => {
      setIsVisible(true);
      clearTimeout(mouseMovementTimeout);
      mouseMovementTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 3000); // Hide after 3 seconds of no mouse movement
    };

    document.addEventListener('mousemove', handleMouseMovement);

    return () => {
      document.removeEventListener('mousemove', handleMouseMovement);
      clearTimeout(mouseMovementTimeout);
    };
  }, [setPrompt]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setPrompt.current = event.target.value; // Update the active prompt as the user types
  };

  const handleInputSubmit = (event) => {
    event.preventDefault();
    // The active prompt is already set via handleInputChange, so this might just handle form submission logic if any
  };

  const handleGoClick = () => {
    // Since the active prompt is updated on change, this might be redundant unless there's additional logic to execute
    setPrompt.current = inputValue;
  };

  return (
    <div style={{ position: 'absolute', bottom: "20px", width: '80%', marginLeft: '10%', zIndex: 2 }}>
      <form onSubmit={handleInputSubmit} style={{ display: 'flex', justifyContent: 'space-between' }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter your prompt here"
          style={{
            width: '90%',
            padding: '10px',
            fontFamily: 'pixeboy',
            fontSize: '20px',
            border: '2px solid white',
            borderRadius: '10px',
            backgroundColor: 'transparent',
            color: 'white',
            visibility: isVisible ? 'visible' : 'hidden'
          }}
        />
        <button
          type="button"
          onClick={handleGoClick}
          style={{
            width: '8%',
            marginLeft: '2%',
            padding: '10px',
            fontFamily: 'pixeboy',
            fontSize: '20px',
            border: '2px solid white',
            borderRadius: '10px',
            backgroundColor: 'transparent',
            color: 'white',
            visibility: isVisible ? 'visible' : 'hidden'
          }}
        >
          GO
        </button>
      </form>
    </div>
  );
}

export default ArtStylesComponent;
