import React, { useState, useEffect } from 'react';
import DARPANGameEngine from './GameEngine';
import { PersonalizationEngine } from './PersonalizationEngine';

const DARPANApp = () => {
  const [gameEngine] = useState(new DARPANGameEngine());
  const [currentUniverse, setCurrentUniverse] = useState(null);
  const [student, setStudent] = useState(null);
  const [gameSession, setGameSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gameEngine.initializeUniverses();
  }, [gameEngine]);

  const universes = [
    { id: 'mathematics', name: 'Logic Realm', theme: 'Architect of Reality', color: '#00FFFF' },
    { id: 'physics', name: 'Force Galaxy', theme: 'Cosmic Engineer', color: '#FF6B35' },
    { id: 'chemistry', name: 'Reaction Labs', theme: 'Element Master', color: '#4ECDC4' },
    { id: 'biology', name: 'Life Systems', theme: 'Life Guardian', color: '#45B7D1' },
    { id: 'computer-science', name: 'Code City', theme: 'Digital Architect', color: '#96CEB4' },
    { id: 'social-science', name: 'Civilization Hub', theme: 'Time Keeper', color: '#FFEAA7' },
    { id: 'english', name: 'Story Studio', theme: 'Word Weaver', color: '#DDA0DD' }
  ];

  const startLearningSession = async (universeId, concept) => {
    setLoading(true);
    try {
      const session = await gameEngine.startLearningSession(student.id, universeId, concept);
      setGameSession(session);
      setCurrentUniverse(universeId);
    } catch (error) {
      console.error('Failed to start learning session:', error);
    }
    setLoading(false);
  };

  const UniverseSelector = () => (
    <div className="universe-selector">
      <h1>Choose Your Learning Universe</h1>
      <div className="universe-grid">
        {universes.map(universe => (
          <div 
            key={universe.id}
            className="universe-card"
            style={{ borderColor: universe.color }}
            onClick={() => setCurrentUniverse(universe.id)}
          >
            <div className="universe-icon" style={{ backgroundColor: universe.color }}>
              {universe.name.charAt(0)}
            </div>
            <h3>{universe.name}</h3>
            <p>{universe.theme}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const GameInterface = () => (
    <div className="game-interface">
      <div className="game-header">
        <button onClick={() => setCurrentUniverse(null)}>← Back to Universes</button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '60%' }}></div>
        </div>
      </div>
      
      <div className="game-canvas">
        <GameCanvas 
          universe={currentUniverse}
          session={gameSession}
          onInteraction={(type, data) => gameEngine.trackInteraction(type, data)}
        />
      </div>

      <div className="game-controls">
        <button className="hint-button">💡 Hint</button>
        <button className="pause-button">⏸️ Pause</button>
        <button className="help-button">❓ Help</button>
      </div>
    </div>
  );

  const GameCanvas = ({ universe, session, onInteraction }) => {
    return (
      <div className="game-canvas-container">
        <canvas 
          id="game-canvas"
          width="800"
          height="600"
          style={{ 
            background: `linear-gradient(45deg, ${universes.find(u => u.id === universe)?.color}20, #000020)`
          }}
        />
        <div className="interactive-overlay">
          {/* Interactive elements will be rendered here based on current game */}
          <InteractiveElements universe={universe} onInteraction={onInteraction} />
        </div>
      </div>
    );
  };

  const InteractiveElements = ({ universe, onInteraction }) => {
    const [draggedElement, setDraggedElement] = useState(null);

    const handleDragStart = (e, elementType) => {
      setDraggedElement(elementType);
      onInteraction('drag_start', { elementType, timestamp: Date.now() });
    };

    const handleDrop = (e) => {
      e.preventDefault();
      onInteraction('drop', { 
        elementType: draggedElement, 
        position: { x: e.clientX, y: e.clientY },
        timestamp: Date.now() 
      });
      setDraggedElement(null);
    };

    return (
      <div className="interactive-elements" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        {universe === 'mathematics' && (
          <>
            <div 
              className="draggable pizza-slice"
              draggable
              onDragStart={(e) => handleDragStart(e, 'pizza-slice')}
            >
              🍕
            </div>
            <div className="alien-colony">
              👽 Hungry Colony
            </div>
          </>
        )}
        
        {universe === 'physics' && (
          <>
            <div 
              className="draggable rescue-pod"
              draggable
              onDragStart={(e) => handleDragStart(e, 'rescue-pod')}
            >
              🚀
            </div>
            <div className="trajectory-line"></div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-animation">🌌</div>
        <p>Initializing your learning universe...</p>
      </div>
    );
  }

  return (
    <div className="darpan-app">
      {!currentUniverse ? <UniverseSelector /> : <GameInterface />}
      
      <style jsx>{`
        .darpan-app {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Arial', sans-serif;
        }

        .universe-selector {
          padding: 2rem;
          text-align: center;
        }

        .universe-selector h1 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 2rem;
        }

        .universe-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .universe-card {
          background: rgba(255, 255, 255, 0.1);
          border: 3px solid;
          border-radius: 15px;
          padding: 1.5rem;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          backdrop-filter: blur(10px);
        }

        .universe-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .universe-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          margin: 0 auto 1rem;
          color: white;
        }

        .universe-card h3 {
          color: white;
          margin: 0.5rem 0;
          font-size: 1.5rem;
        }

        .universe-card p {
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        .game-interface {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .game-header {
          background: rgba(0, 0, 0, 0.8);
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .game-header button {
          background: #4ECDC4;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          color: white;
          cursor: pointer;
        }

        .progress-bar {
          flex: 1;
          height: 10px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 5px;
          margin: 0 2rem;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4ECDC4, #44A08D);
          transition: width 0.3s;
        }

        .game-canvas-container {
          flex: 1;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        #game-canvas {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }

        .interactive-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .interactive-elements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: auto;
        }

        .draggable {
          position: absolute;
          cursor: grab;
          font-size: 2rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          user-select: none;
        }

        .draggable:active {
          cursor: grabbing;
        }

        .game-controls {
          background: rgba(0, 0, 0, 0.8);
          padding: 1rem;
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .game-controls button {
          background: #667eea;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          color: white;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s;
        }

        .game-controls button:hover {
          background: #5a67d8;
        }

        .loading-screen {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
        }

        .loading-animation {
          font-size: 4rem;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DARPANApp;