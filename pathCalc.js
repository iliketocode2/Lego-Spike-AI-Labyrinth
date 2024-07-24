function initializePopup() {
    const popup = document.getElementById("popup");
    const yesButton = document.getElementById("yesButton");
    const noButton = document.getElementById("noButton");

    window.showPopup = function() {
        popup.classList.remove("fade-out");
        popup.classList.add("fade-in");
        popup.style.display = "block";
    }

    function hidePopup(val) {
        if (val === 1) {
            console.log("Simulation started");
            runAISimulation();
        } else {
            console.log("Simulation ended");
            window.gameStarted = true;
        }
        popup.classList.remove("fade-in");
        popup.classList.add("fade-out");
    }

    yesButton.addEventListener("click", function() { hidePopup(1); });
    noButton.addEventListener("click", function() { hidePopup(0); });

    popup.addEventListener("transitionend", function() {
        console.log('fading popup');
        if (popup.classList.contains("fade-out")) {
            popup.style.display = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", initializePopup);

function startSim() {
    window.showPopup();
}

function runAISimulation() {
    generateRewardSystem();
    runQLearning();
}

function generateRewardSystem() {
    const rewardGrid = [];
    const endRow = parseInt(window.endSquare.dataset.row);
    const endCol = parseInt(window.endSquare.dataset.col);
    const maxDistance = Math.sqrt(Math.pow(window.ROWS - 1, 2) + Math.pow(window.COLS - 1, 2));

    for (let i = 0; i < window.ROWS; i++) {
        rewardGrid[i] = [];
        for (let j = 0; j < window.COLS; j++) {
            const distance = Math.sqrt(Math.pow(i - endRow, 2) + Math.pow(j - endCol, 2));
            const normalizedDistance = distance / maxDistance;
            rewardGrid[i][j] = 1 - normalizedDistance;
        }
    }

    // Set a higher reward for the end square
    rewardGrid[endRow][endCol] = 10;

    console.log("Generated Reward Grid:", rewardGrid);
    return rewardGrid;
}

class QLearningAgent {
    constructor(env, alpha = 0.1, gamma = 0.9, epsilon = 0.1) {
        this.env = env;
        this.alpha = alpha;
        this.gamma = gamma;
        this.epsilon = epsilon;
        this.qtable = this.initializeQTable();
        this.actions = ['up', 'down', 'left', 'right'];
    }

    initializeQTable() {
        const table = {};
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                table[`${i},${j}`] = {
                    up: 0,
                    down: 0,
                    left: 0,
                    right: 0
                };
            }
        }
        return table;
    }

    chooseAction(state) {
        if (Math.random() < this.epsilon) {
            return this.actions[Math.floor(Math.random() * this.actions.length)];
        } else {
            const stateActions = this.qtable[state];
            return Object.keys(stateActions).reduce((a, b) => stateActions[a] > stateActions[b] ? a : b);
        }
    }

    learn(state, action, reward, nextState) {
        const predict = this.qtable[state][action];
        const target = reward + this.gamma * Math.max(...Object.values(this.qtable[nextState]));
        this.qtable[state][action] += this.alpha * (target - predict);
    }
}

class Environment {
    constructor(rewardGrid) {
        this.rewardGrid = rewardGrid;
        this.currentState = this.getStartState();
        this.endState = this.getEndState();
        
        // Add this logging
        console.log("Reward Grid:", this.rewardGrid);
        console.log("Start State:", this.currentState);
        console.log("End State:", this.endState);
    }

    getStartState() {
        const startRow = parseInt(window.startSquare.dataset.row);
        const startCol = parseInt(window.startSquare.dataset.col);
        return `${startRow},${startCol}`;
    }

    getEndState() {
        const endRow = parseInt(window.endSquare.dataset.row);
        const endCol = parseInt(window.endSquare.dataset.col);
        return `${endRow},${endCol}`;
    }

    reset() {
        this.currentState = this.getStartState();
        return this.currentState;
    }

    step(action) {
        const [row, col] = this.currentState.split(',').map(Number);
        let newRow = row;
        let newCol = col;

        switch (action) {
            case 'up': newRow--; break;
            case 'down': newRow++; break;
            case 'left': newCol--; break;
            case 'right': newCol++; break;
        }

        // Add error checking
        if (!this.rewardGrid || !this.rewardGrid[newRow] || typeof this.rewardGrid[newRow][newCol] === 'undefined') {
            console.error("Invalid rewardGrid access:", newRow, newCol);
            console.log("Current rewardGrid:", this.rewardGrid);
            return [this.currentState, -1, false]; // Return current state with a penalty
        }

        if (this.isValidMove(row, col, newRow, newCol)) {
            this.currentState = `${newRow},${newCol}`;
        }

        const reward = this.rewardGrid[newRow][newCol];
        const done = this.currentState === this.endState;

        return [this.currentState, reward, done];
    }

    isValidMove(row, col, newRow, newCol) {
        if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
            return false;
        }

        // Check for walls
        const wallElement = document.querySelector(`.wall-space[data-row="${Math.min(row, newRow)}"][data-col="${Math.min(col, newCol)}"]`);
        if (wallElement && wallElement.classList.contains('wall')) {
            if (row !== newRow && wallElement.classList.contains('horizontal')) {
                return false;
            }
            if (col !== newCol && wallElement.classList.contains('vertical')) {
                return false;
            }
        }

        return true;
    }
}

function runQLearning() {
    const rewardGrid = generateRewardSystem();
    console.log("Reward Grid in runQLearning:", rewardGrid);
    const env = new Environment(rewardGrid);
    const agent = new QLearningAgent(env);

    const numEpisodes = 50;
    const maxSteps = 100;

    for (let episode = 0; episode < numEpisodes; episode++) {
        let state = env.reset();
        console.log(`Episode ${episode + 1}, Initial State: ${state}`);
        for (let step = 0; step < maxSteps; step++) {
            const action = agent.chooseAction(state);
            console.log(`Step ${step + 1}, Action: ${action}`);
            const [nextState, reward, done] = env.step(action);
            console.log(`Next State: ${nextState}, Reward: ${reward}, Done: ${done}`);
            agent.learn(state, action, reward, nextState);
            state = nextState;
            if (done) break;
        }
    }

    showTrainingCompletePopup();
    displayOptimalPath(agent);
}

function showTrainingCompletePopup() {
    const popup = document.getElementById("popup");
    popup.textContent = 'Training complete!';
    popup.style.transform = 'translate(0%, 525%)'; 
    popup.style.opacity = '1';
    setTimeout(() => popup.remove(), 2000);
}

function displayOptimalPath(agent) {
    let state = agent.env.getStartState();
    const path = [state];
    const maxPathLength = window.ROWS * window.COLS; // Maximum possible path length
    let stepCount = 0;

    console.log("Start state:", state);
    console.log("End state:", agent.env.endState);

    while (state !== agent.env.endState && stepCount < maxPathLength) {
        console.log("Current state:", state);
        console.log("Q-values for current state:", agent.qtable[state]);

        const action = Object.keys(agent.qtable[state]).reduce((a, b) => agent.qtable[state][a] > agent.qtable[state][b] ? a : b);
        console.log("Chosen action:", action);

        const [row, col] = state.split(',').map(Number);
        let newRow = row;
        let newCol = col;

        switch (action) {
            case 'up': newRow--; break;
            case 'down': newRow++; break;
            case 'left': newCol--; break;
            case 'right': newCol++; break;
        }

        if (newRow < 0 || newRow >= window.ROWS || newCol < 0 || newCol >= window.COLS) {
            console.log("Invalid move, breaking the loop");
            break;
        }

        state = `${newRow},${newCol}`;
        path.push(state);
        stepCount++;

        console.log("New state:", state);
        console.log("Current path:", path);
    }

    console.log("Final path:", path);

    if (stepCount >= maxPathLength) {
        console.log("Maximum path length reached, path may be incomplete");
    }

    path.forEach(state => {
        const [row, col] = state.split(',').map(Number);
        const cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            const pathMarker = document.createElement('div');
            pathMarker.className = 'path-marker';
            pathMarker.style.cssText = 'width: 10px; height: 10px; background: none; border: 1px solid white; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);';
            cell.appendChild(pathMarker);
        }
    });
}