# OOCAA-API

***I am on a windows laptop btw***

If u guys also have a windows computer I recommend u guys install WSL (Windows Subsystem for Linux) (i'm not sure about mac lol sorry). It's just easier to set up github via linux terminal and down the line you can commit changes right from the terminal. It also works cohesively with vscode and u just face less issues compared to working in windows command prompt or powershell.

make sure u guys have git and node installed on your local, if not you can do this via the linux terminal (or any terminal if u have mac or don't wanna use wsl). 

also make sure u have mongodb installed, and that the service mongod is up and active.

Clone this repo either via https or ssh (i recommend via ssh but u have to set up an ssh key on your github account before you clone or else it might say permission denied).

after you cloned it successfully, navigate to the project directory and run npm install (make sure u have node installed) this will install all the packages listed in package.json

after all dependencies are installed, create your own .env file. Add the database URL in it which (for the mean time) should be this:

DATABASE_URL=mongodb://localhost/cdm-data

if your default port isn't 3000 you can also define the port number in here by putting this in the .env:

PORT=3000

You must also generate a token with the command:
```
openssl rand -hex 32
```
and add the following line to your .env:
```
JWT_SECRET_KEY=[the token you generated here]
```
This is necessary for the JWT account tokens to work.

when u did npm install, nodemon should've been installed. nodemon is helpful when starting the server cuz it'll restart everytime u make a change. start the server by running: npm run devStart. if this doesn't work, run: node server.js

if successful, you should see in the terminal: 
Server Started
Connected to Database

everything should be working, you can test the endpoints via postman or curl
