// DARPAN Game Engine - Production Version
class GameEngine {
  constructor() {
    this.currentGame = null;
    this.gameState = {
      score: 0,
      startTime: null,
      interactions: [],
      correctAnswers: 0,
      totalAttempts: 0,
      hintsUsed: 0
    };
    this.timer = null;
    this.userId = null;
    this.token = null;
  }

  init(userId, token) {
    this.userId = userId;
    this.token = token;
  }

  async startGame(gameType) {
    this.currentGame = gameType;
    this.gameState = {
      score: 0,
      startTime: Date.now(),
      interactions: [],
      correctAnswers: 0,
      totalAttempts: 0,
      hintsUsed: 0
    };

    if (this.currentArcadeSession) {
      this.currentArcadeSession.stop();
      this.currentArcadeSession = null;
    }

    if (gameType === 'arcade-space') {
      // Initialize Real-time Arcade Mode
      const canvas = document.getElementById('game-canvas');
      // Ensure proper canvas sizing for arcade
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      this.currentArcadeSession = new CosmicDefender(canvas, {});
      this.currentArcadeSession.start();
      document.getElementById('game-title').textContent = "🚀 Cosmic Defender: Arcade Mode";
      this.timer = setInterval(() => this.updateTimer(), 1000);
      return;
    }

    this.timer = setInterval(() => this.updateTimer(), 1000);

    const gameConfig = this.getGameConfig(gameType);
    this.renderGame(gameConfig);
  }

  getGameConfig(gameType) {
    const configs = {
      'math-fractions': {
        title: 'Math: Fraction Pizza Challenge',
        subject: 'math',
        concept: 'fractions',
        difficulty: 0.5,
        elements: [
          { type: 'draggable', id: 'pizza-half', value: '1/2', emoji: '🍕', label: 'Half Pizza' },
          { type: 'draggable', id: 'pizza-quarter', value: '1/4', emoji: '🍕', label: 'Quarter Pizza' },
          { type: 'draggable', id: 'pizza-three-quarter', value: '3/4', emoji: '🍕', label: 'Three-Quarter' },
          { type: 'dropzone', id: 'colony-a', accepts: '1/2', emoji: '👽', label: 'Colony A (Needs: 1/2)' },
          { type: 'dropzone', id: 'colony-b', accepts: '1/4', emoji: '👽', label: 'Colony B (Needs: 1/4)' },
          { type: 'dropzone', id: 'colony-c', accepts: '3/4', emoji: '👽', label: 'Colony C (Needs: 3/4)' }
        ],
        winCondition: 3
      },
      'science-circuits': {
        title: 'Science: Circuit Builder Challenge',
        subject: 'science',
        concept: 'circuits',
        difficulty: 0.6,
        elements: [
          { type: 'draggable', id: 'battery', value: 'power', emoji: '🔋', label: 'Battery' },
          { type: 'draggable', id: 'resistor', value: 'component', emoji: '📏', label: 'Resistor' },
          { type: 'draggable', id: 'led', value: 'output', emoji: '💡', label: 'LED' },
          { type: 'dropzone', id: 'power-slot', accepts: 'power', label: 'Power Source' },
          { type: 'dropzone', id: 'component-slot', accepts: 'component', label: 'Component' },
          { type: 'dropzone', id: 'output-slot', accepts: 'output', label: 'Output' }
        ],
        winCondition: 3
      },
      'engineering-bridge': {
        title: 'Engineering: Bridge Designer Challenge',
        subject: 'engineering',
        concept: 'structures',
        difficulty: 0.7,
        elements: [
          { type: 'draggable', id: 'steel-beam', value: 'steel', emoji: '📏', label: 'Steel Beam', strength: 15 },
          { type: 'draggable', id: 'wood-beam', value: 'wood', emoji: '🪵', label: 'Wood Beam', strength: 8 },
          { type: 'draggable', id: 'cable', value: 'cable', emoji: '🔗', label: 'Cable', strength: 12 },
          { type: 'dropzone', id: 'bridge-area', accepts: 'any', label: 'Bridge Construction Area' }
        ],
        winCondition: 30,
        testRequired: true
      },
      'tech-coding': {
        title: 'Technology: Code Quest Challenge',
        subject: 'technology',
        concept: 'programming',
        difficulty: 0.5,
        elements: [
          { type: 'draggable', id: 'move-forward', value: 'move', emoji: '➡️', label: 'Move Forward' },
          { type: 'draggable', id: 'turn-right', value: 'turn', emoji: '🔄', label: 'Turn Right' },
          { type: 'draggable', id: 'repeat', value: 'loop', emoji: '🔁', label: 'Repeat 3x' },
          { type: 'dropzone', id: 'step-1', accepts: 'any', label: 'Step 1' },
          { type: 'dropzone', id: 'step-2', accepts: 'any', label: 'Step 2' },
          { type: 'dropzone', id: 'step-3', accepts: 'any', label: 'Step 3' }
        ],
        winCondition: 3,
        executeRequired: true
      }
    };

    return configs[gameType];
  }

  renderGame(config) {
    const canvas = document.getElementById('game-canvas');
    document.getElementById('game-title').textContent = config.title;

    let html = '<div class="game-elements">';

    // Render draggable elements
    const draggables = config.elements.filter(e => e.type === 'draggable');
    html += '<div class="draggables-container">';
    draggables.forEach((elem, idx) => {
      html += `
        <div class="draggable" 
             draggable="true" 
             data-id="${elem.id}" 
             data-value="${elem.value}"
             data-strength="${elem.strength || 0}"
             style="top: ${50 + idx * 70}px; left: 50px;">
          <span class="emoji">${elem.emoji}</span>
          <span class="label">${elem.label}</span>
        </div>
      `;
    });
    html += '</div>';

    // Render drop zones
    const dropzones = config.elements.filter(e => e.type === 'dropzone');
    html += '<div class="dropzones-container">';
    dropzones.forEach((elem, idx) => {
      html += `
        <div class="drop-zone" 
             data-id="${elem.id}" 
             data-accepts="${elem.accepts}"
             style="top: ${50 + idx * 90}px; right: 50px;">
          ${elem.emoji ? `<span class="emoji">${elem.emoji}</span>` : ''}
          <span class="label">${elem.label}</span>
        </div>
      `;
    });
    html += '</div>';

    // Add special buttons for certain games
    if (config.testRequired) {
      html += '<button class="btn test-btn" onclick="gameEngine.testBridge()">🧪 Test Bridge</button>';
    }
    if (config.executeRequired) {
      html += '<button class="btn execute-btn" onclick="gameEngine.executeProgram()">▶️ Run Program</button>';
    }

    html += '</div>';
    canvas.innerHTML = html;

    this.setupDragAndDrop();
  }

  setupDragAndDrop() {
    const draggables = document.querySelectorAll('.draggable');
    const dropzones = document.querySelectorAll('.drop-zone');

    draggables.forEach(draggable => {
      draggable.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
          id: e.target.dataset.id,
          value: e.target.dataset.value,
          strength: e.target.dataset.strength || 0
        }));
        e.target.style.opacity = '0.5';
      });

      draggable.addEventListener('dragend', (e) => {
        e.target.style.opacity = '1';
      });
    });

    dropzones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');

        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        this.handleDrop(data, zone);
      });
    });
  }

  handleDrop(dragData, dropZone) {
    this.gameState.totalAttempts++;

    const accepts = dropZone.dataset.accepts;
    const isCorrect = accepts === 'any' || accepts === dragData.value;

    this.trackInteraction({
      type: 'drop',
      correct: isCorrect,
      draggedItem: dragData.id,
      dropZone: dropZone.dataset.id,
      timestamp: Date.now()
    });

    if (isCorrect) {
      this.gameState.correctAnswers++;
      this.updateScore(20);
      this.showFeedback('Correct! Great job! 🎉', 'success');

      // Hide dragged element
      const draggedElement = document.querySelector(`[data-id=\"${dragData.id}\"]`);
      if (draggedElement) draggedElement.style.display = 'none';

      // Mark drop zone as filled
      dropZone.classList.add('filled');
      dropZone.innerHTML += `<div class="dropped-item">${dragData.value}</div>`;

      // Check win condition
      const config = this.getGameConfig(this.currentGame);
      if (this.gameState.correctAnswers >= config.winCondition) {
        setTimeout(() => this.completeGame(), 1000);
      }
    } else {
      this.showFeedback('Try again! Check the requirements. 🤔', 'error');
    }
  }

  testBridge() {
    const strength = parseInt(document.querySelectorAll('.filled').length) * 10;

    if (strength >= 30) {
      this.showFeedback('Bridge test successful! Strong enough! 🌉✅', 'success');
      this.completeGame();
    } else {
      this.showFeedback(`Bridge strength: ${strength}/30. Add more materials! 🔧`, 'error');
    }
  }

  executeProgram() {
    const filledSteps = document.querySelectorAll('.drop-zone.filled').length;

    if (filledSteps >= 3) {
      this.showFeedback('Program executed! Robot reached goal! 🤖🎯', 'success');
      this.completeGame();
    } else {
      this.showFeedback('Program needs all 3 steps! 💻', 'error');
    }
  }

  trackInteraction(interaction) {
    this.gameState.interactions.push(interaction);
  }

  updateScore(points) {
    this.gameState.score += points;
    document.getElementById('score').textContent = this.gameState.score;
  }

  updateTimer() {
    const elapsed = Math.floor((Date.now() - this.gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  showFeedback(message, type) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.style.display = 'block';

    setTimeout(() => {
      feedback.style.display = 'none';
    }, 3000);
  }

  showHint() {
    this.gameState.hintsUsed++;

    const hints = {
      'math-fractions': 'Match the pizza fractions to what each alien colony needs! Look at the labels carefully. 🍕',
      'science-circuits': 'Connect battery to power source, resistor to component, and LED to output to complete the circuit! ⚡',
      'engineering-bridge': 'Use different materials to build a strong bridge. Each material adds strength. Test when ready! 🌉',
      'tech-coding': 'Drag code blocks in the correct sequence to program the robot to reach the goal! 💻'
    };

    this.showFeedback(`💡 Hint: ${hints[this.currentGame]}`, 'info');
  }

  async completeGame() {
    clearInterval(this.timer);

    const timeSpent = Math.floor((Date.now() - this.gameState.startTime) / 1000);
    const accuracy = this.gameState.totalAttempts > 0
      ? (this.gameState.correctAnswers / this.gameState.totalAttempts)
      : 0;

    const config = this.getGameConfig(this.currentGame);

    // Save to backend
    try {
      const response = await fetch('/api/game-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          subject: config.subject,
          gameType: this.currentGame,
          score: this.gameState.score,
          timeSpent: timeSpent,
          completed: true,
          accuracy: accuracy,
          hintsUsed: this.gameState.hintsUsed,
          interactions: this.gameState.interactions
        })
      });

      if (response.ok) {
        this.showFeedback(
          `🎉 Game Complete! Score: ${this.gameState.score} | Time: ${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')} | Accuracy: ${Math.round(accuracy * 100)}%`,
          'success'
        );
      }
    } catch (error) {
      console.error('Failed to save game session:', error);
      this.showFeedback('Game completed but failed to save. Check connection.', 'error');
    }
  }

  reset() {
    if (this.timer) clearInterval(this.timer);
    if (this.currentGame) this.startGame(this.currentGame);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.currentGame = null;
  }
}

// Global instance
const gameEngine = new GameEngine();