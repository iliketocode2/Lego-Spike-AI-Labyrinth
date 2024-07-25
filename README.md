# Build and Program the AI Spike Labyrinth
<h3>OpenMV & Uart, Q-learning, Bluetooth, and Pyscript (With extra js)</h3>
<p>The goal of this project was to explore potential roles for the Lego Spike Prime in a system with external devices and heavy computation and graphical display. This repository contains all of the code and instruction necessary for you to recreate a similar project should you choose to do so. In addition if you are looking here for specific Spike-related processes (such as connecting to the Spike with bluetooth or using Pyscript with the Spike in general) parts of my code feature comments and explanations of these applications.</p>

## DISCLAIMER
<p>This project is not yet finished as I have yet to write the AI algorithm that physically runs the lego motors to move the ball from the chosen start square to the end square. There are also many existing bugs. Feel free to create issues for this repository.</p>

## Materials
  - ### Hardware
    - Lego Spike
    - OpenMV Cam (I used an R2) with a [custom PCB connector on the back](https://www.instructables.com/Backpack-1-OpenMV-Camera/) -- this will connect to the black section of a lego ultrasonic sensor
    - [Lego pieces](https://www.brickowl.com/catalog/lego-spike-prime-set-45678/inventory): This model contains ~480 pieces</li>
    - [A red Lego ball](https://www.brickowl.com/catalog/lego-red-hard-plastic-ball-52mm-22119-23065) (unless you change the openMV color detection/blob code)</li>
    - [Instructions for the model I built](https://drive.google.com/file/d/1D8D3vNA3ystbz31rbjCMvUVYvHGMd4PP/view?usp=sharing)
    - A cord to connect the Spike Prime to your computer (typically usb to micro usb)
  
  - ### Software
    - [OpenMV IDE](https://openmv.io/pages/download)
    - [Visual Studio Code](https://code.visualstudio.com/download) or another IDE to run Pyscript on: [Pyscript.com](https://pyscript.com), [Github Codespace with Pyscript presetup](https://github.com/ntoll/codespaces-project-template-pyscript), etc
    - [BLE_CEEO.py](https://github.com/chrisbuerginrogers/SPIKE_Prime/blob/main/BLE/BLE_CEEO.py#L1) -- Download this file onto the Spike Prime using [Thonny](https://thonny.org). This IDE is very effective at connecting micropython devices.
  
  - ### Firmware
    - [Custom firmware](https://raw.githack.com/tuftsceeo/SPIKE-html/main/index.html) for the Spike Prime
      - To install:
        1. Turn off the Spike Prime and disconnect it from all devices
        2. Hold down the bluetooth button until it strobes blue, green, pink
        3. Plug in the Spike to your computer
        4. Press 'Connect Up' and follow prompts to install the new firmware
    
    This firmware enables UART communication on the Spike Prime Hub. To restore the original firmware, open the official spike IDE (where you would normally write spike code) and click 'update hub'

## Further Reading:
- [UART](https://www.analog.com/en/resources/analog-dialogue/articles/uart-a-hardware-communication-protocol.html)
- [Lego Spike Prime Python Library](https://spike.legoeducation.com/prime/help/lls-help-python#lls-help-python-spm)
- [OpenMV docs](https://docs.openmv.io)
- [Q-learning Explanation](https://www.datacamp.com/tutorial/introduction-q-learning-beginner-tutorial)

![spike labyrinth model render](https://github.com/user-attachments/assets/572d4f52-462e-4aab-9dce-a34d50dcdc79)
