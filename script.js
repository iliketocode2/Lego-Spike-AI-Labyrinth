document.addEventListener('DOMContentLoaded', function() {
    const ROWS = 5;
    const COLS = 5;
    let walls = [];
    let nodes = [];
    
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
    const FRICTION = 0.83; // reversed: 1 is no friction, 0 is all friction
    const MIN_TILT_ANGLE = 0.005; // minimum tilt angle to overcome static friction (in radians)
    const RESTITUTION = 0.9; // Coefficient of restitution for bouncing
    // const ENERGY_LOSS = 0.2;
    let startSquare = null;
    let endSquare = null;
    let isSelectingStart = false;
    let isSelectingEnd = false;
    let gameStarted = false;
    let ballControlMode = 'coordinates';

    //--------------------------------- Start and End grid loop setup ---------------------------------

    function initializeGame() {
        startSquare = null;
        endSquare = null;
        isSelectingStart = true;
        isSelectingEnd = false;
        gameStarted = false;
        promptUser("Select the start square");
    }
    
    function promptUser(message) {
        document.getElementById('update-text').innerHTML = message;
    }
    
    function handleSquareClick(event) {
        const square = event.target;
        if (isSelectingStart) {
            setStartSquare(square);
        } else if (isSelectingEnd) {
            setEndSquare(square);
        }
    }
    
    function setStartSquare(square) {
        if (startSquare) {
            startSquare.classList.remove('start');
            startSquare.textContent = '';
        }
        startSquare = square;
        startSquare.classList.add('start');
        startSquare.textContent = 'Start';
        isSelectingStart = false;
        isSelectingEnd = true;
        promptUser("Select the end square");
    }
    
    function setEndSquare(square) {
        if (endSquare) {
            endSquare.classList.remove('end');
            endSquare.textContent = '';
        }
        endSquare = square;
        endSquare.classList.add('end');
        endSquare.textContent = 'End';
        isSelectingEnd = false;
        promptUser("Move the ball to the end square");
        initializeBall();
    }
    
    function initializeBall() {
        const cellWidth = CANVAS_WIDTH / COLS;
        const cellHeight = CANVAS_HEIGHT / ROWS;
        ballX = (parseInt(startSquare.dataset.col) + 0.5) * cellWidth;
        ballY = (parseInt(startSquare.dataset.row) + 0.5) * cellHeight;
        velocityX = 0;
        velocityY = 0;
        ballRotation = 0;
        gameStarted = true;
    }
    
    function checkEndReached() {
        const cellWidth = CANVAS_WIDTH / COLS;
        const cellHeight = CANVAS_HEIGHT / ROWS;
        const endX = (parseInt(endSquare.dataset.col) + 0.5) * cellWidth;
        const endY = (parseInt(endSquare.dataset.row) + 0.5) * cellHeight;
        
        const distance = Math.sqrt(Math.pow(ballX - endX, 2) + Math.pow(ballY - endY, 2));
        if (distance < BALL_RADIUS * 2) {
            promptUser("Goal reached! Restarting the game.");
            startSquare.classList.remove('start');
            startSquare.textContent = '';
            endSquare.classList.remove('end');
            endSquare.textContent = '';
            initializeGame();
        }
    }

    //----------------------------------------------- Grid and Node Setup ------------------------------------------------

    function createGrid(rows, cols) { // initialize grid properties and divs
        const gridContainer = document.getElementById('grid-container');
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', handleSquareClick);
                gridContainer.appendChild(cell);
            }
        }
    
        for (let i = 0; i <= rows; i++) {
            for (let j = 0; j <= cols; j++) {
                const node = document.createElement('div');
                node.classList.add('grid-node');
                node.style.gridRow = i + 1;
                node.style.gridColumn = j + 1;
                node.dataset.row = i;
                node.dataset.col = j;
                
                // Check if the node is on the perimeter
                if (i === 0 || i === rows || j === 0 || j === cols) {
                    node.classList.add('selected', 'perimeter');
                }

                node.addEventListener('click', toggleNodeSelection);
                gridContainer.appendChild(node);
    
                // Store node positions for collision detection
                nodes.push({
                    x: j * CANVAS_WIDTH / cols,
                    y: i * CANVAS_HEIGHT / rows,
                    radius: 5 // Radius of the node for collision detection
                });
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
        ctx.fillStyle = '#fcd3d2';
        ctx.fill();
    }

    window.drawBall = function(x, y) {
        if (ballControlMode === 'coordinates' && gameStarted) {
            ballX = x;
            ballY = y;
        }
    };

    function drawWalls() {
        ctx.strokeStyle = '#3d3b34';
        ctx.lineWidth = 6;
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

        //control ball position
        if (ballControlMode === 'sensors' && gameStarted) {
            if (gameStarted) {
                let tiltX = Math.sin(roll);
                let tiltY = Math.sin(pitch);
            
                let rotatedTiltX = tiltX * Math.cos(yaw) - tiltY * Math.sin(yaw);
                let rotatedTiltY = tiltX * Math.sin(yaw) + tiltY * Math.cos(yaw);
            
                let tiltMagnitude = Math.sqrt(rotatedTiltX * rotatedTiltX + rotatedTiltY * rotatedTiltY);
            
                // Check if tilt exceeds the minimum angle to overcome static friction
                if (tiltMagnitude > MIN_TILT_ANGLE) {
                    let accX = rotatedTiltX * GRAVITY;
                    let accY = rotatedTiltY * GRAVITY;
            
                    velocityX += accX;
                    velocityY += accY;
            
                    velocityX *= FRICTION;
                    velocityY *= FRICTION;
            
                    let newX = ballX + velocityX;
                    let newY = ballY + velocityY;
            
                    // Check for wall collisions
                    let collided = handleWallCollisions(newX, newY);
            
                    // If no collision occurred, update ball position
                    if (!collided) {
                        ballX = newX;
                        ballY = newY;
                    }
            
                    // Check for node collisions
                    handleNodeCollisions(ballX, ballY);
            
                    // Keep ball within canvas bounds (with bounce)
                    handleBoundaryCollisions();
            
                    const distanceMoved = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
                    ballRotation += distanceMoved / BALL_RADIUS;
            
                    if (Math.abs(velocityX) < 0.01) velocityX = 0;
                    if (Math.abs(velocityY) < 0.01) velocityY = 0;
                } else {
                    // Ball doesn't move due to static friction
                    velocityX = 0;
                    velocityY = 0;
                }
            }
        }

        drawGrid();
        drawWalls();

        if (gameStarted) {
            drawBall(ballX, ballY);
            checkEndReached();
            if (ballControlMode === 'sensors') {
                drawTiltIndicator(pitch, roll, yaw);
            }
        }
    }

    function handleWallCollisions(newX, newY) {
        const cellWidth = CANVAS_WIDTH / COLS;
        const cellHeight = CANVAS_HEIGHT / ROWS;
        let collided = false;
        
        walls.forEach(wall => {
            const x1 = wall.x1 * cellWidth;
            const y1 = wall.y1 * cellHeight;
            const x2 = wall.x2 * cellWidth;
            const y2 = wall.y2 * cellHeight;
            
            if (lineCircleCollision(x1, y1, x2, y2, newX, newY, BALL_RADIUS)) {
                collided = true;
                const wallVector = {x: x2 - x1, y: y2 - y1};
                const wallLength = Math.sqrt(wallVector.x * wallVector.x + wallVector.y * wallVector.y);
                const normal = {x: -wallVector.y / wallLength, y: wallVector.x / wallLength};

                // Calculate the dot product of velocity and normal
                const dot = velocityX * normal.x + velocityY * normal.y;

                // Reverse velocity and apply energy loss
                velocityX = (velocityX - 2 * dot * normal.x) * RESTITUTION;
                velocityY = (velocityY - 2 * dot * normal.y) * RESTITUTION;

                // Move the ball to just touch the wall
                const distanceToWall = distancePointToLine(ballX, ballY, x1, y1, x2, y2) - BALL_RADIUS;
                ballX -= distanceToWall * normal.x;
                ballY -= distanceToWall * normal.y;
            }
        });

        return collided;
    }

    function handleWallCollisions(newX, newY) {
        const cellWidth = CANVAS_WIDTH / COLS;
        const cellHeight = CANVAS_HEIGHT / ROWS;
        let collided = false;
        
        walls.forEach(wall => {
            const x1 = wall.x1 * cellWidth;
            const y1 = wall.y1 * cellHeight;
            const x2 = wall.x2 * cellWidth;
            const y2 = wall.y2 * cellHeight;
            
            if (lineCircleCollision(x1, y1, x2, y2, newX, newY, BALL_RADIUS)) {
                collided = true;
                const wallVector = {x: x2 - x1, y: y2 - y1};
                const wallLength = Math.sqrt(wallVector.x * wallVector.x + wallVector.y * wallVector.y);
                const normal = {x: -wallVector.y / wallLength, y: wallVector.x / wallLength};
    
                // Calculate the dot product of velocity and normal
                const dot = velocityX * normal.x + velocityY * normal.y;
    
                // Apply restitution to the reflected velocity
                velocityX = (velocityX - 2 * dot * normal.x) * RESTITUTION;
                velocityY = (velocityY - 2 * dot * normal.y) * RESTITUTION;
    
                // Move the ball to just touch the wall
                const distanceToWall = distancePointToLine(ballX, ballY, x1, y1, x2, y2) - BALL_RADIUS;
                ballX -= distanceToWall * normal.x;
                ballY -= distanceToWall * normal.y;
            }
        });
    
        return collided;
    }

    function handleBoundaryCollisions() {
        if (ballX < BALL_RADIUS) {
            ballX = BALL_RADIUS;
            velocityX = -velocityX * RESTITUTION;
        } else if (ballX > CANVAS_WIDTH - BALL_RADIUS) {
            ballX = CANVAS_WIDTH - BALL_RADIUS;
            velocityX = -velocityX * RESTITUTION;
        }
    
        if (ballY < BALL_RADIUS) {
            ballY = BALL_RADIUS;
            velocityY = -velocityY * RESTITUTION;
        } else if (ballY > CANVAS_HEIGHT - BALL_RADIUS) {
            ballY = CANVAS_HEIGHT - BALL_RADIUS;
            velocityY = -velocityY * RESTITUTION;
        }
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

    function handleNodeCollisions(newX, newY) {
        nodes.forEach(node => {
            const dx = newX - node.x;
            const dy = newY - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < BALL_RADIUS + node.radius) {
                // Collision detected, calculate normal vector
                const normal = {x: dx / distance, y: dy / distance};

                // Calculate relative velocity
                const relativeVelocity = {x: velocityX, y: velocityY};

                // Calculate velocity along the normal
                const velocityAlongNormal = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;

                // Only resolve if objects are moving towards each other
                if (velocityAlongNormal < 0) {
                    // Calculate impulse scalar
                    const impulseScalar = -(1 + RESTITUTION) * velocityAlongNormal;

                    // Apply impulse
                    velocityX += impulseScalar * normal.x;
                    velocityY += impulseScalar * normal.y;

                    // Move the ball outside the node
                    const moveDistance = BALL_RADIUS + node.radius - distance;
                    ballX += moveDistance * normal.x;
                    ballY += moveDistance * normal.y;
                }
            }
        });
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
        const radius = BALL_RADIUS * 2; // You can adjust this multiplier as needed
    
        // Calculate tilt direction
        let tiltX = Math.sin(roll);
        let tiltY = Math.sin(pitch);
    
        // Rotate tilt direction based on yaw
        let rotatedTiltX = tiltX * Math.cos(yaw) - tiltY * Math.sin(yaw);
        let rotatedTiltY = tiltX * Math.sin(yaw) + tiltY * Math.cos(yaw);
    
        // Draw tilt direction line
        ctx.beginPath();
        ctx.moveTo(ballX, ballY);
        ctx.lineTo(ballX + rotatedTiltX * radius, ballY + rotatedTiltY * radius);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
    
        // Draw line indicating the "forward" direction
        ctx.beginPath();
        ctx.moveTo(ballX, ballY);
        ctx.lineTo(ballX + Math.sin(yaw) * radius, ballY - Math.cos(yaw) * radius);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function animate() {
        moveCircle(lastPitch, lastRoll, lastYaw);
        requestAnimationFrame(animate);
    }

    window.updateAngles = function(pitch, roll, yaw) {
        lastPitch = pitch;
        lastRoll = roll;
        lastYaw = yaw;
    };

    //change mode and button between x, y control and yaw, pitch, and roll control
    window.toggleBallControlMode = function() {
        const toggle = document.getElementById('toggleMode');
        const slider = toggle.querySelector('.slider');
        
        if (ballControlMode === 'sensors') {
            ballControlMode = 'coordinates';
            slider.style.transform = 'translateX(0)';
        } else {
            ballControlMode = 'sensors';
            slider.style.transform = 'translateX(-50%)';
        }
        
        console.log('Ball control mode switched to:', ballControlMode);
    };

    animate();
    window.updateAngles(0, 0, 0); //initial draw
    initializeGame();
});