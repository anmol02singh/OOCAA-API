# OOCAA-API
## Preface
***I am on a windows laptop btw***

If u guys also have a windows computer I recommend u guys install WSL (Windows Subsystem for Linux) (i'm not sure about mac lol sorry). It's just easier to set up github via linux terminal and down the line you can commit changes right from the terminal. It also works cohesively with vscode and u just face less issues compared to working in windows command prompt or powershell.

## Setup
make sure u guys have git and node installed on your local, if not you can do this via the linux terminal (or any terminal if u have mac or don't wanna use wsl). 

also make sure u have mongodb installed, and that the service mongod is up and active.

Clone this repo either via https or ssh (i recommend via ssh but u have to set up an ssh key on your github account before you clone or else it might say permission denied).

after you cloned it successfully, navigate to the project directory and run npm install (make sure u have node installed) this will install all the packages listed in package.json

after all dependencies are installed, create your own .env file.

### .env File
Add the database URL in it which (for the mean time) should be this:
```
DATABASE_URL=mongodb://localhost/cdm-data
```
if your default port isn't 3000 you can also define the port number in here by putting this in the .env:
```
PORT=3000
```

<br/>

For the JWT account tokens to work, generate a token with the command:
```
openssl rand -hex 32
```
and add the following line to your .env:
```
JWT_SECRET_KEY=[the token you generated here]
```

<br/>

For the profile image system to work, add the following:
```
CLOUDINARY_CLOUD_NAME=dzdbnoch9
CLOUDINARY_PARENT_FOLDER=OOCAA/profileImages
CLOUDINARY_KEY=437337699859197
CLOUDINARY_SECRET_KEY=bK3iYpyTp-ybuqYB3Fpm7K9X-d8
```
Images are stored via uploading to a "cloud" or server space with the [cloudinary](https://cloudinary.com/) service and saving associated URLs in OOCAA's database. The above 4 values help access the cloud and the specific path for storing images.

If you want to use your own account for testing, make your own [cloudinary](https://cloudinary.com/) account for free and then follow the below steps.
* Change the **CLOUDINARY_CLOUD_NAME**, **CLOUDINARY_KEY**, and **CLOUDINARY_SECRET_KEY** values to those listed under **Programmable Media > Dashboard** and **Dashboard > Go to API Keys** in your account.
* Ideally **keep CLOUDINARY_PARENT_FOLDER as OOCAA/profileImages** to maintain the same file structure.
* You can set up and view the folder structure described by CLOUDINARY_PARENT_FOLDER and any uploaded files under **Assets > Folders**.
* Place the [default profile image](https://res.cloudinary.com/dzdbnoch9/image/upload/v1741495294/placeholderProfileImage_wsa3w8.png) directly in the profileImages folder following the CLOUDINARY_PARENT_FOLDER structure.

<br/>

The final .env file should look something like this:
```
DATABASE_URL=mongodb://localhost/cdm-data
PORT=3000
JWT_SECRET_KEY=d304064c40744e847bfdf063ee3f21ba621e1527eb3d7aa32bdb5c87e45c0d81
CLOUDINARY_CLOUD_NAME=dzdbnoch9
CLOUDINARY_PARENT_FOLDER=OOCAA/profileImages
CLOUDINARY_KEY=437337699859197
CLOUDINARY_SECRET_KEY=bK3iYpyTp-ybuqYB3Fpm7K9X-d8
```

## Startup
when u did npm install, nodemon should've been installed. nodemon is helpful when starting the server cuz it'll restart everytime u make a change. start the server by running: npm run devStart. if this doesn't work, run: node server.js

if successful, you should see in the terminal: 
Server Started
Connected to Database

everything should be working, you can test the endpoints via postman or curl

## Testing
This system can be tested using the command `npm test`.

These tests will only work if there is an account with username "testuser" and password "testpass".  It also only works when the system is running.
