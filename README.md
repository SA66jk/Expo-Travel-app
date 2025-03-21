Travel App Project
This project can be opened and run in multiple ways. Here, we demonstrate how to open and run the project using VSCode and Docker Desktop.

Prerequisites
Ensure that VSCode and Docker Desktop are installed on your computer, and complete the basic registration and login.

Download VSCode: https://code.visualstudio.com/

Download Docker Desktop: https://www.docker.com/get-started/

Ensure that your phone has the Expo Go app installed.

Download the project code from GitHub as a ZIP file and extract it.

Steps to Open and Run the Project
1. Run Docker Desktop
Start Docker Desktop on your computer.

2. Open the Project in VSCode
Open VSCode and install the Dev Containers extension if not already installed.

Press Ctrl+Shift+P on your keyboard.

Click on Dev Containers: Open Folder in Container... from the top menu.

Select the extracted project folder.

Choose Add configuration to workspace.

Select Node.js & JavaScript.

Select 22-bookworm.

Click OK without making any additional selections.

Click OK again without making any additional selections.

Now, you have successfully opened the project in VSCode.

3. Run the Project
Open the terminal in VSCode.

Run the command: npm install

After the installation is complete, run the following command: npx expo start

Once the command runs successfully, a QR code will appear.

Open your phone's camera and scan the QR code to run the project in the Expo Go app.

Important Notes
Ensure that your phone and computer are connected to the same Wi-Fi network! Otherwise, the project will not run on your phone.