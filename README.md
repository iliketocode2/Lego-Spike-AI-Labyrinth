<h1> Build and Program the AI Spike Labyrinth</h1>
<h3>OpenMV & Uart, Q-learning, Bluetooth, and Pyscript (With extra js)</h3>
<p>The goal of this project was to explore potential roles for the Lego Spike Prime in a system with external devices and heavy computation and graphical display. Now, this repository contains all of the code and instruction necessary for you to recreate a similar project should you choose to do so. In addition if you are looking here for specific Spike-related processes (such as connecting to the Spike with bluetooth or using pyscript with the Spike in general) parts of my code feature comments and explanation of these applications.</p>

###

<h2>DISCLAIMER</h2>
<p>This project is not yet finished as I have yet to write the AI algorithm that has physically runs the lego motors to move the ball from the chosen start square to the end square.</p>

###

<h3>Materials:</h3>
<ul>
  <li>**Hardware**</li>
  <ul>
    <li>Lego Spike</li>
    <li>OpenMV Cam (I used an R2) with a <a href="https://www.instructables.com/Backpack-1-OpenMV-Camera/">custom PCB connector on the back</a> -- this will connect to the black section of a lego ultrasonic sensor</li>
    <li><a href="https://www.brickowl.com/catalog/lego-spike-prime-set-45678/inventory">Lego pieces</a>: This model contains ~480 pieces</li>
    <li><a href="https://drive.google.com/file/d/1D8D3vNA3ystbz31rbjCMvUVYvHGMd4PP/view?usp=sharing">Instructions made by me for the model I built</a></li>
    <li>A cord to connect the Spike Prime to your computer (typically usb to micro usb)</li>
  </ul>
  <li>**Software**</li>
  <ul>
    <li>OpenMV IDE</li>
    <li>Visual Studio Code or another IDE to run pyscript on: Pyscript.com, Github Codespace with pyscript presetup, etc</li>
    <li><a href="https://github.com/chrisbuerginrogers/SPIKE_Prime/blob/main/BLE/BLE_CEEO.py#L1">BLE_CEEO.py</a>: Download onto Spike Prime</li>
  </ul>
  <li>**Firmware**</li>
  <ul>
    <li><a href="https://raw.githack.com/tuftsceeo/SPIKE-html/main/index.html">Custom firmware</a>: Download onto Spike Prime</li>
    <p>This firmware enables uart communication on the Spike Prime Hub. To restore the original firmware, open the official spike IDE (where you would normally write spike code) and click 'update hub'</p>
  </ul>
</ul>

###

<h3>Further Reading:</h3>
<ul>
  <li><a href="https://www.analog.com/en/resources/analog-dialogue/articles/uart-a-hardware-communication-protocol.html">UART</a></li>
  <li><a href="https://spike.legoeducation.com/prime/help/lls-help-python#lls-help-python-spm">Lego Spike Prime Python Library</a></li>
  <li><a href="https://docs.openmv.io">OpenMV docs</a></li>
  <li><a href="https://www.datacamp.com/tutorial/introduction-q-learning-beginner-tutorial">Q-learning Explanation</a></li>
</ul>

###

![spike labyrinth model render](https://github.com/user-attachments/assets/572d4f52-462e-4aab-9dce-a34d50dcdc79)
