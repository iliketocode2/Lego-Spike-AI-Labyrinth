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

//update motor positions based on key states
// const throttledUpdate = throttle(() => {
//     if (keyStates.ArrowUp && !keyStates.ArrowDown) {
//         verticalMotorPosition = Math.min(13, verticalMotorPosition + 1);
//     } else if (keyStates.ArrowDown && !keyStates.ArrowUp) {
//         verticalMotorPosition = Math.max(-3, verticalMotorPosition - 1);
//     }

//     if (keyStates.ArrowRight && !keyStates.ArrowLeft) {
//         horizontalMotorPosition = Math.min(-170, horizontalMotorPosition + 1);
//     } else if (keyStates.ArrowLeft && !keyStates.ArrowRight) {
//         horizontalMotorPosition = Math.max(-182, horizontalMotorPosition - 1);
//     }

//     //send updated positions to main.py
//     window.sendMotorPos(verticalMotorPosition, horizontalMotorPosition);
// }, 100); // 100ms delay, adjust as needed
let direction = 0
let motorName = 1
const throttledUpdate = throttle(() => {
    if (keyStates.ArrowUp && !keyStates.ArrowDown) {
        direction = -1
        motorName = 1
    } else if (keyStates.ArrowDown && !keyStates.ArrowUp) {
        direction = 1
        motorName = 1
    }

    if (keyStates.ArrowRight && !keyStates.ArrowLeft) {
        direction = 1
        motorName = 0
    } else if (keyStates.ArrowLeft && !keyStates.ArrowRight) {
        direction = -1
        motorName = 0
    }

    //send updated positions to main.py
    window.sendMotorPos(motorName, direction);
}, 100);

function updateMotorPositions() {
    throttledUpdate();
}

// Event listener for keydown
document.addEventListener('keydown', (event) => {
    if (event.key in keyStates) {
        keyStates[event.key] = true;
        updateMotorPositions();
    }
});

// Event listener for keyup
document.addEventListener('keyup', (event) => {
    if (event.key in keyStates) {
        keyStates[event.key] = false;
    }
});
