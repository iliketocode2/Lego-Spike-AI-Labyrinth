# Build and Program the AI Spike Labyrinth
<h3>OpenMV & Uart, Q-learning, Bluetooth, and Pyscript (With extra js)</h3>
<p>The goal of this project was to explore potential roles for the Lego Spike Prime in a system with external devices and heavy computation and graphical display. This repository contains all of the necessary code and instructions for you to recreate a similar project should you choose to do so. In addition, if you are looking here for specific Spike-related processes (such as connecting to the Spike with Bluetooth or using Pyscript with the Spike in general) parts of my code feature comments and explanations of these applications.</p>

> [!WARNING]
> Much of the code in this project is custom to my setup (i.e., motor starting values and other constants). However, I have identified these variables in my code, so it is necessary to read files carefeully before executing them. In addition, this project contains many existing bugs. Feel free to create issues for this repository.

## Communication Overview
![commnication flow chart](https://github.com/user-attachments/assets/9fabc1e3-81ef-417d-94d6-e6918032a667)
- Solid lines depict physical connection; dotted lines depict ble connection.
- Double-sided arrows indicate two-way communication (send and receive) data, single sided arrows represent one-way communication.

## Website Overview
The [website](https://iliketocode2.github.io/Lego-Spike-AI-Labyrinth/) (what you will have displayed on your screen after running the code in an IDE with HTML preview features) features two primary modes: Free Play mode and AI mode. Within Free Play mode there are two sub modes: (x, y) mapping and (pitch, roll) mapping. 
- To enter Free Play mode, draw labyrinth walls, select a start and end square, and select ‘no’ when the popup prompts you to draw the path. Then, to toggle between (x, y) and (pitch, roll) mode, change the toggle on the bottom of the screen. The (x, y) mode uses coordinates sent from the script running on the OpenMV camera to move the animated ball. The (pitch, roll) mode uses pitch and roll data from the Spike to simulate the location of the ball (basically running a physics simulation).
- To enter AI mode draw labyrinth walls, select a start and end square, and select ‘yes’ when the popup prompts you to draw the path. To have the Spike move the ball from the start square to the end square press 'Run the Spike along the path'. After the run attempt is complete, the grid will reset if the ball has correctly reached the end square. Otherwise, click 'Manual Stop' to reset the run.

If the orientation of your screen compared to the physical device you build is off, simply rotate the on-screen grid by pressing the arrow button on either side of the grid. 

## Materials
  - ### Hardware
    - Lego Spike
    - OpenMV Cam (I used an R2) with a [custom PCB connector on the back](https://www.instructables.com/Backpack-1-OpenMV-Camera/) -- this will connect to the black section of a lego ultrasonic sensor
    - [Lego pieces](https://www.brickowl.com/catalog/lego-spike-prime-set-45678/inventory): This model contains ~480 pieces</li>
    - [A red Lego ball](https://www.brickowl.com/catalog/lego-red-hard-plastic-ball-52mm-22119-23065) (unless you change the OpenMV color detection/blob code)</li>
    - [Instructions](https://drive.google.com/file/d/1RjmZkfVSPhEm0D2quI89XZbNSfkmIFvk/view?usp=sharing) for the model
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
    
> [!IMPORTANT]
> This firmware enables UART communication on the Spike Prime Hub. To restore the original firmware, open the official [Spike IDE](https://spike.legoeducation.com/) and click 'update hub'. Also note that while this firmware is generally excellent, there is a slight bug with the motors that causes oscillation on remote disconnect. This should NOT affect this project.

## Further Reading
- [UART](https://www.analog.com/en/resources/analog-dialogue/articles/uart-a-hardware-communication-protocol.html)
- [BLE](https://novelbits.io/bluetooth-low-energy-ble-complete-guide/)
- [Lego Spike Prime Python Library](https://spike.legoeducation.com/prime/help/lls-help-python#lls-help-python-spm)
- [OpenMV docs](https://docs.openmv.io)
- [Q-learning Explanation](https://www.datacamp.com/tutorial/introduction-q-learning-beginner-tutorial)
- [How to setup Github Pages and VS Code with GitHub](https://shimmering-cesium-c35.notion.site/Summer-of-24-0c8bd589e46b4b8b84bc484837b5b102?p=a9854b32e4454b29ae056981a6eb6ee1&pm=c)

## Build Render
(![AI Spike Maze Render](https://github.com/user-attachments/assets/84e43fb1-906a-4cce-95dd-5be04c1b3ec9)
