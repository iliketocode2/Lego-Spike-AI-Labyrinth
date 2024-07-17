document.addEventListener('DOMContentLoaded', function() {
    function createGrid(rows, cols) {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
        for (let i = 0; i < rows * cols; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.index = i;
            cell.addEventListener('click', toggleCellSelection);
            gridContainer.appendChild(cell);
        }
    }
    
    function toggleCellSelection(event) {
        event.target.classList.toggle('selected');
    }
    
    function setupCanvas() {
        const canvas = document.getElementById('animationCanvas');
        const simulation = document.getElementById('simulation');
        canvas.width = simulation.offsetWidth;
        canvas.height = simulation.offsetHeight;
        return canvas.getContext('2d');
    }
    
    // num of grid square x, y
    createGrid(10, 10);
    
    // Setup canvas
    const ctx = setupCanvas();
    
    const CANVAS_WIDTH = ctx.canvas.width;
    const CANVAS_HEIGHT = ctx.canvas.height;
    const BALL_RADIUS = 15;
    let ballX = CANVAS_WIDTH / 2;
    let ballY = CANVAS_HEIGHT / 2;
    let ballRotation = 0;
    let lastPitch = 0;
    let lastRoll = 0;
    let lastYaw = 0;
    let velocityX = 0;
    let velocityY = 0;
    const GRAVITY = 9.81;
    const FRICTION = 0.53;

    function drawBall(x, y) {
        // Main circle
        ctx.beginPath();
        ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
    
        // Shading to give 3D effect
        const gradient = ctx.createRadialGradient(
            x - BALL_RADIUS / 3, y - BALL_RADIUS / 3, BALL_RADIUS / 10,
            x, y, BALL_RADIUS
        );
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(1, 'red');
    
        ctx.beginPath();
        ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    
        // small circle to show rotation
        ctx.beginPath();
        ctx.arc(x + Math.cos(ballRotation) * BALL_RADIUS / 2, 
                y + Math.sin(ballRotation) * BALL_RADIUS / 2, 
                BALL_RADIUS / 5, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    function moveCircle(pitch, roll, yaw) {
        // Clear the canvas
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
        // Convert pitch and roll to a tilt vector
        let tiltX = Math.sin(roll);
        let tiltY = Math.sin(pitch);
    
        // Rotate the tilt vector based on yaw
        let rotatedTiltX = tiltX * Math.cos(yaw) - tiltY * Math.sin(yaw);
        let rotatedTiltY = tiltX * Math.sin(yaw) + tiltY * Math.cos(yaw);
    
        // Calculate acceleration based on rotated tilt
        let accX = rotatedTiltX * GRAVITY;
        let accY = rotatedTiltY * GRAVITY;
    
        // Update velocity
        velocityX += accX
        velocityY += accY;
    
        // Apply friction
        velocityX *= FRICTION;
        velocityY *= FRICTION;
    
        // Update ball position
        ballX += velocityX;
        ballY += velocityY
    
        // Keep ball within canvas bounds (with bounce)
        if (ballX < BALL_RADIUS) {
            ballX = BALL_RADIUS;
            velocityX = -velocityX * 0.8; // Bounce with some energy loss
        } else if (ballX > CANVAS_WIDTH - BALL_RADIUS) {
            ballX = CANVAS_WIDTH - BALL_RADIUS;
            velocityX = -velocityX * 0.8;
        }
    
        if (ballY < BALL_RADIUS) {
            ballY = BALL_RADIUS;
            velocityY = -velocityY * 0.8;
        } else if (ballY > CANVAS_HEIGHT - BALL_RADIUS) {
            ballY = CANVAS_HEIGHT - BALL_RADIUS;
            velocityY = -velocityY * 0.8;
        }
    
        // Update ball rotation based on movement
        const distanceMoved = Math.sqrt(Math.pow(velocityX, 2) + Math.pow(velocityY, 2));
        ballRotation += distanceMoved / BALL_RADIUS;
    
        // a small threshold for velocity to prevent tiny movements:
        if (Math.abs(velocityX) < 0.01) velocityX = 0;
        if (Math.abs(velocityY) < 0.01) velocityY = 0;

        drawBall(ballX, ballY);
        drawTiltIndicator(pitch, roll, yaw);
    }

    // Function to draw an indicator showing tilt direction
    function drawTiltIndicator(pitch, roll, yaw) {
        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;
        const radius = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) / 4;
    
        // Calculate tilt direction
        let tiltX = Math.sin(roll);
        let tiltY = Math.sin(pitch);
    
        // Rotate tilt direction based on yaw
        let rotatedTiltX = tiltX * Math.cos(yaw) - tiltY * Math.sin(yaw);
        let rotatedTiltY = tiltX * Math.sin(yaw) + tiltY * Math.cos(yaw);
    
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + rotatedTiltX * radius, centerY + rotatedTiltY * radius);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
    
        // line indicating the "forward" direction
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.sin(yaw) * radius, centerY - Math.cos(yaw) * radius);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function resetBall() {
        ballX = CANVAS_WIDTH / 2;
        ballY = CANVAS_HEIGHT / 2;
        velocityX = 0;
        velocityY = 0;
        ballRotation = 0;
    }

    function animate() {
        moveCircle(lastPitch, lastRoll, lastYaw);
        requestAnimationFrame(animate);
    }

    window.updateAngles = function(pitch, roll, yaw) {
        lastPitch = pitch;
        lastRoll = roll;
        lastYaw = yaw;
        moveCircle(pitch, roll, yaw);
    };
    
    // window.resetBall = resetBall;
    animate();
    window.updateAngles(0, 0, 0);   //initial draw
});