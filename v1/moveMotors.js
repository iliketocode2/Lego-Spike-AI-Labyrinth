//for my setup, the motor positions are in the ranges I listed below. You may need to adjust these values based on your setup.
let verticalMotorPosition = 0;  // Range: -3 to 13
let horizontalMotorPosition = -176;  // Range: -182 to -170

const keyStates = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

const throttledUpdate = throttle(() => {
    let direction = 0;
    let motorName = -1;

    //check if no arrow keys are pressed, keys setup so the ball goes in the directon of the last key pressed
    if (!keyStates.ArrowUp && !keyStates.ArrowDown && !keyStates.ArrowLeft && !keyStates.ArrowRight) {
        window.sendMotorPos(2, 2); //special signal to indicate no movement
        return;
    }

    if (keyStates.ArrowUp && !keyStates.ArrowDown) {
        direction = 1;
        motorName = 1;
    } else if (keyStates.ArrowDown && !keyStates.ArrowUp) {
        direction = -1;
        motorName = 1;
    }

    if (keyStates.ArrowRight && !keyStates.ArrowLeft) {
        direction = -1;
        motorName = 0;
    } else if (keyStates.ArrowLeft && !keyStates.ArrowRight) {
        direction = 1;
        motorName = 0;
    }

    // Send updated positions to main.py only if a valid motor is selected
    if (motorName !== -1) {
        window.sendMotorPos(motorName, direction);
    }
}, 100);

function updateMotorPositions() {
    throttledUpdate();
}

// Event listener for keydown
document.addEventListener('keydown', (event) => {
    if (window.gameStarted){
        if (event.key in keyStates) {
            keyStates[event.key] = true;
            updateMotorPositions();
        }
    }
});

// Event listener for keyup
document.addEventListener('keyup', (event) => {
    if (window.gameStarted){
        if (event.key in keyStates) {
            keyStates[event.key] = false;
            updateMotorPositions();
        }
    }
});

// Continuously update motor positions
function updateMotorsCall(){
    // console.log('CONDI: ' + window.gameStarted);
    if (window.gameStarted){
        updateMotorPositions();
    }
}

setInterval(updateMotorsCall, 100);
