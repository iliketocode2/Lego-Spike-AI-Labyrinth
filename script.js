document.addEventListener('DOMContentLoaded', function() {
    const ROWS = 5;
    const COLS = 5;
    let walls = [];

    function createGrid(rows, cols) { // initialize grid properties and divs
        const gridContainer = document.getElementById('grid-container');
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                gridContainer.appendChild(cell);
            }
        }
    
        for (let i = 0; i <= rows; i++) {
            for (let j = 0; j <= cols; j++) {
                if (!((i == 0 && j == 0) || (i == 0 && j == cols) || (i == rows && j == 0) || (i == rows && j == cols))) { // if not the corners
                    const node = document.createElement('div');
                    node.classList.add('grid-node');
                    node.style.gridRow = i + 1;
                    node.style.gridColumn = j + 1;
                    node.dataset.row = i;
                    node.dataset.col = j;
                    node.addEventListener('click', toggleNodeSelection);
                    gridContainer.appendChild(node);
                }
            }
        }
    }

    function drawGrid() {
        const cellWidth = CANVAS_WIDTH / COLS;
        const cellHeight = CANVAS_HEIGHT / ROWS;
    
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
    
        for (let i = 0; i <= ROWS; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellHeight);
            ctx.lineTo(CANVAS_WIDTH, i * cellHeight);
            ctx.stroke();
        }
    
        for (let j = 0; j <= COLS; j++) {
            ctx.beginPath();
            ctx.moveTo(j * cellWidth, 0);
            ctx.lineTo(j * cellWidth, CANVAS_HEIGHT);
            ctx.stroke();
        }
    }
    
    function toggleNodeSelection(event) {
        const node = event.target;
        node.classList.toggle('selected');
        checkForWalls(node);
    }

    function checkForWalls(node) {
        const row = parseInt(node.dataset.row);
        const col = parseInt(node.dataset.col);
        
        const directions = [
            {dr: 0, dc: 1}, // right
            {dr: 1, dc: 0}, // down
            {dr: 0, dc: -1}, // left
            {dr: -1, dc: 0}  // up
        ];
        
        directions.forEach(dir => { // wall handler
            const neighborRow = row + dir.dr;
            const neighborCol = col + dir.dc;
            const neighbor = document.querySelector(`.grid-node[data-row="${neighborRow}"][data-col="${neighborCol}"]`);
            
            if (neighbor && neighbor.classList.contains('selected')) {
                if (node.classList.contains('selected')) {
                    addWall(row, col, neighborRow, neighborCol);
                } else {
                    removeWall(row, col, neighborRow, neighborCol);
                }
            }
        });
    }

    function addWall(row1, col1, row2, col2) {
        const newWall = {x1: col1, y1: row1, x2: col2, y2: row2};
        if (!walls.some(wall => // tests whether at least one element in the array passes the test implemented by the provided function (true or false)
            (wall.x1 === newWall.x1 && wall.y1 === newWall.y1 && wall.x2 === newWall.x2 && wall.y2 === newWall.y2) ||
            (wall.x1 === newWall.x2 && wall.y1 === newWall.y2 && wall.x2 === newWall.x1 && wall.y2 === newWall.y1)
        )) {
            walls.push(newWall);
        }
    }

    function removeWall(row1, col1, row2, col2) {
        walls = walls.filter(wall => // creates a new array with all elements that pass the test implemented by the provided function
            !(wall.x1 === col1 && wall.y1 === row1 && wall.x2 === col2 && wall.y2 === row2) &&
            !(wall.x1 === col2 && wall.y1 === row2 && wall.x2 === col1 && wall.y2 === row1)
        );
    }

    function setupCanvas() {
        const canvas = document.getElementById('animationCanvas');
        const simulation = document.getElementById('simulation');
        canvas.width = simulation.offsetWidth;
        canvas.height = simulation.offsetHeight;
        return canvas.getContext('2d');
    }
    
    createGrid(ROWS, COLS);

    //--------------------------------- Ball Simulation and Canvas Setup ---------------------------------
    
    const ctx = setupCanvas();
    
    const CANVAS_WIDTH = ctx.canvas.width;
    const CANVAS_HEIGHT = ctx.canvas.height;
    const BALL_RADIUS = 25;
    let ballX = CANVAS_WIDTH / 2;
    let ballY = CANVAS_HEIGHT / 2;
    let ballRotation = 0;
    let lastPitch = 0;
    let lastRoll = 0;
    let lastYaw = 0;
    let velocityX = 0;
    let velocityY = 0;
    const GRAVITY = 9.81;
    const FRICTION = 0.73;

    function drawBall(x, y) {
        // main circle
        ctx.beginPath();
        ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
    
        // shading to give 3D effect
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
    
        // small circle to visualize rotation of the ball
        ctx.beginPath();
        ctx.arc(x + Math.cos(ballRotation) * BALL_RADIUS / 2, 
                y + Math.sin(ballRotation) * BALL_RADIUS / 2, 
                BALL_RADIUS / 5, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    function drawWalls() {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        const cellWidth = CANVAS_WIDTH / COLS;
        const cellHeight = CANVAS_HEIGHT / ROWS;
        
        walls.forEach(wall => {
            ctx.beginPath();
            ctx.moveTo(wall.x1 * cellWidth, wall.y1 * cellHeight);
            ctx.lineTo(wall.x2 * cellWidth, wall.y2 * cellHeight);
            ctx.stroke();
        });
    }

    function moveCircle(pitch, roll, yaw) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
        let tiltX = Math.sin(roll);
        let tiltY = Math.sin(pitch);
    
        let rotatedTiltX = tiltX * Math.cos(yaw) - tiltY * Math.sin(yaw);
        let rotatedTiltY = tiltX * Math.sin(yaw) + tiltY * Math.cos(yaw);
    
        let accX = rotatedTiltX * GRAVITY;
        let accY = rotatedTiltY * GRAVITY;
    
        velocityX += accX;
        velocityY += accY;
    
        velocityX *= FRICTION;
        velocityY *= FRICTION;
    
        let newX = ballX + velocityX;
        let newY = ballY + velocityY;
    
        // Check for wall collisions
        const cellWidth = CANVAS_WIDTH / COLS;
        const cellHeight = CANVAS_HEIGHT / ROWS;
        
        walls.forEach(wall => {
            const x1 = wall.x1 * cellWidth;
            const y1 = wall.y1 * cellHeight;
            const x2 = wall.x2 * cellWidth;
            const y2 = wall.y2 * cellHeight;
            
            if (lineCircleCollision(x1, y1, x2, y2, newX, newY, BALL_RADIUS)) {
                // Calculate the normal vector of the wall
                const wallVector = {x: x2 - x1, y: y2 - y1};
                const wallLength = Math.sqrt(wallVector.x * wallVector.x + wallVector.y * wallVector.y);
                const normal = {x: -wallVector.y / wallLength, y: wallVector.x / wallLength};
    
                // Calculate the dot product of velocity and normal
                const dot = velocityX * normal.x + velocityY * normal.y;
    
                // Update velocity (reflection)
                velocityX = velocityX - 2 * dot * normal.x;
                velocityY = velocityY - 2 * dot * normal.y;
    
                // Apply some energy loss
                velocityX *= 0.8;
                velocityY *= 0.8;
    
                // Move the ball to just touch the wall
                const distanceToWall = distancePointToLine(ballX, ballY, x1, y1, x2, y2) - BALL_RADIUS;
                newX = ballX - distanceToWall * normal.x;
                newY = ballY - distanceToWall * normal.y;
            }
        });
    
        ballX = newX;
        ballY = newY;
    
        // Keep ball within canvas bounds (with bounce)
        if (ballX < BALL_RADIUS) {
            ballX = BALL_RADIUS;
            velocityX = -velocityX * 0.8;
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
    
        const distanceMoved = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        ballRotation += distanceMoved / BALL_RADIUS;
    
        if (Math.abs(velocityX) < 0.01) velocityX = 0;
        if (Math.abs(velocityY) < 0.01) velocityY = 0;
    
        drawGrid();
        drawWalls();
        drawBall(ballX, ballY);
        drawTiltIndicator(pitch, roll, yaw);
    }

    function lineCircleCollision(x1, y1, x2, y2, cx, cy, r) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const fx = x1 - cx;
        const fy = y1 - cy;
        const a = dx * dx + dy * dy;
        const b = 2 * (fx * dx + fy * dy);
        const c = (fx * fx + fy * fy) - r * r;
        const discriminant = b * b - 4 * a * c;
        
        if (discriminant < 0) {
            return false;
        }
        
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        
        if ((0 <= t1 && t1 <= 1) || (0 <= t2 && t2 <= 1)) {
            return true;
        }
        
        return false;
    }

    function lineCircleCollision(x1, y1, x2, y2, cx, cy, r) {
        const closest = closestPointOnLine(cx, cy, x1, y1, x2, y2);
        const distanceSquared = (cx - closest.x) * (cx - closest.x) + (cy - closest.y) * (cy - closest.y);
        return distanceSquared <= r * r;
    }
    
    function closestPointOnLine(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
        const clampedT = Math.max(0, Math.min(1, t));
        return {
            x: x1 + clampedT * dx,
            y: y1 + clampedT * dy
        };
    }
    
    function distancePointToLine(px, py, x1, y1, x2, y2) {
        const closest = closestPointOnLine(px, py, x1, y1, x2, y2);
        const dx = px - closest.x;
        const dy = py - closest.y;
        return Math.sqrt(dx * dx + dy * dy);
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

    animate();
    window.updateAngles(0, 0, 0);   // initial draw
});