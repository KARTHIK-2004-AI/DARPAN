class ArcadeEngine {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.width = canvas.width;
        this.height = canvas.height;
        this.active = false;
        this.lastTime = 0;

        // Game State
        this.entities = [];
        this.particles = [];
        this.score = 0;
        this.gameOver = false;

        // Input
        this.keys = {};
        this.setupInput();
    }

    setupInput() {
        window.addEventListener('keydown', e => this.keys[e.key] = true);
        window.addEventListener('keyup', e => this.keys[e.key] = false);
        this.canvas.addEventListener('mousemove', e => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        this.canvas.addEventListener('mousedown', () => this.mouseDown = true);
        this.canvas.addEventListener('mouseup', () => this.mouseDown = false);
    }

    start() {
        this.active = true;
        this.lastTime = performance.now();
        this.initGame();
        requestAnimationFrame(t => this.loop(t));
    }

    stop() {
        this.active = false;
    }

    loop(currentTime) {
        if (!this.active) return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(t => this.loop(t));
    }

    // specific game impl
    initGame() { }
    update(dt) { }
    render() {
        this.ctx.fillStyle = '#000'; // Clear
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}

class CosmicDefender extends ArcadeEngine {
    initGame() {
        this.player = { x: 50, y: this.height / 2, speed: 300, health: 100, cooldown: 0 };
        this.enemies = [];
        this.bullets = [];
        this.stars = Array(50).fill().map(() => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 2,
            speed: Math.random() * 50 + 20
        }));
        this.spawnTimer = 0;
    }

    update(dt) {
        if (this.gameOver) return;

        // Player Movement
        if (this.keys['ArrowUp'] || this.keys['w']) this.player.y -= this.player.speed * dt;
        if (this.keys['ArrowDown'] || this.keys['s']) this.player.y += this.player.speed * dt;

        // Clamp Player
        this.player.y = Math.max(20, Math.min(this.height - 20, this.player.y));

        // Shooting
        if (this.keys[' ']) {
            if (this.player.cooldown <= 0) {
                this.bullets.push({ x: this.player.x + 20, y: this.player.y, speed: 500 });
                this.player.cooldown = 0.2; // Fire rate
            }
        }
        if (this.player.cooldown > 0) this.player.cooldown -= dt;

        // Background Stars
        this.stars.forEach(s => {
            s.x -= s.speed * dt;
            if (s.x < 0) s.x = this.width;
        });

        // Spawning Enemies
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.enemies.push({
                x: this.width,
                y: Math.random() * (this.height - 40) + 20,
                speed: Math.random() * 100 + 100,
                size: 30
            });
            this.spawnTimer = 1.5 - Math.min(1.0, this.score * 0.01); // Harder over time
        }

        // Update Entities
        this.bullets.forEach(b => b.x += b.speed * dt);
        this.enemies.forEach(e => e.x -= e.speed * dt);

        // Collision Detection
        this.bullets = this.bullets.filter(b => {
            let hit = false;
            this.enemies = this.enemies.filter(e => {
                if (hit) return true; // Already acted
                const dx = b.x - e.x;
                const dy = b.y - e.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 20) {
                    hit = true;
                    this.score += 10;
                    gameEngine.updateScore(10); // Sync with main engine
                    // Add particles here
                    return false; // Remove enemy
                }
                return true;
            });
            return !hit && b.x < this.width;
        });

        // Player Collision
        this.enemies.forEach(e => {
            const dx = this.player.x - e.x;
            const dy = this.player.y - e.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 30) {
                this.gameOver = true;
                gameEngine.showFeedback(`GAME OVER! Score: ${this.score}`, 'error');
                setTimeout(() => gameEngine.completeGame(), 2000);
            }
        });

        // Cleanup
        this.enemies = this.enemies.filter(e => e.x > -50);
    }

    render() {
        // Clear Background with trail
        this.ctx.fillStyle = 'rgba(10, 10, 20, 0.3)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Stars
        this.ctx.fillStyle = '#FFF';
        this.stars.forEach(s => {
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        if (this.gameOver) {
            this.ctx.fillStyle = '#FF4444';
            this.ctx.font = '40px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("MISSION FAILED", this.width / 2, this.height / 2);
            return;
        }

        // Draw Player (Ship)
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + 20, this.player.y);
        this.ctx.lineTo(this.player.x - 10, this.player.y - 15);
        this.ctx.lineTo(this.player.x - 10, this.player.y + 15);
        this.ctx.fill();

        // Engine Glow
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#4ECDC4';

        // Draw Enemies
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#FF6B6B';
        this.enemies.forEach(e => {
            this.ctx.beginPath();
            this.ctx.arc(e.x, e.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            // Alien Eyes
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(e.x - 5, e.y - 5, 4, 4);
            this.ctx.fillRect(e.x - 5, e.y + 2, 4, 4);
            this.ctx.fillStyle = '#FF6B6B';
        });

        // Draw Bullets
        this.ctx.fillStyle = '#FFE66D';
        this.bullets.forEach(b => {
            this.ctx.fillRect(b.x, b.y - 2, 10, 4);
        });
    }
}
