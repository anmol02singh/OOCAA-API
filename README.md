# OOCAA-API

A Node.js backend for the OOCAA (Online Orbital Collision Alert and Analysis) platform, designed to fetch, process, and serve conjunction data messages (CDMs) for satellite collision monitoring and visualization.

## Prerequisites

Before running the project locally, ensure the following are installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)

> **Windows Users**  
> It's highly recommended to use [WSL (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/) with a terminal like Ubuntu. It works seamlessly with VSCode and avoids many common issues with PowerShell or Command Prompt.

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/oocaa-api.git
# OR
git clone git@github.com:your-username/oocaa-api.git
```
> **SSH Recommended**  
> If you use SSH, make sure you’ve set up your [SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) on GitHub beforehand.

### 2. Install Dependencies

```cd oocaa-api
npm install
```

### 3. Configure Environment Variables

Create a .env file in the root directory with the following content:

```
# MongoDB
DATABASE_URL=mongodb://localhost/cdm-data

# App Port
PORT=3000

# JWT Authentication
JWT_SECRET_KEY=your_generated_jwt_secret

# Cloudinary (for profile images)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_PARENT_FOLDER=OOCAA/profileImages
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret
```

#### Generating a JWT Secret
```
openssl rand -hex 32
```

#### Cloudinary Notes

Images are stored via uploading to a "cloud" or server space with the [cloudinary](https://cloudinary.com/) service and saving associated URLs in OOCAA's database. The above 4 Cloudinary values help access the cloud and the specific path for storing images.

If you want to use your own account for testing, make your own [cloudinary](https://cloudinary.com/) account for free and then follow the below steps.
* Change the `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_KEY`, and `CLOUDINARY_SECRET_KEY` values to those listed under **Programmable Media > Dashboard** and **Dashboard > Go to API Keys** in your account.
* Ideally keep `CLOUDINARY_PARENT_FOLDER` as `OOCAA/profileImages` to maintain the same file structure.
* You can set up and view the folder structure described by CLOUDINARY_PARENT_FOLDER and any uploaded files under **Assets > Folders**.
* Place the [default profile image](https://res.cloudinary.com/dzdbnoch9/image/upload/v1741495294/placeholderProfileImage_wsa3w8.png) directly in the profileImages folder following the CLOUDINARY_PARENT_FOLDER structure.

### 4. Run MongoDB

Make sure MongoDB is running:

```
systemctl status mongod
```

## Running the Server

Start the dev server with:

```
npm run devStart
```

Or fall back to:

```
node server.js
```

If successful, you should see:

```
Server Started
Connected to Database
```

everything should be working, you can test the endpoints via postman or curl

## Testing the API
This system can be tested automatically using the command `npm test`.

These tests will only work if there is an account with username "testuser", password "Te$tpa55" and email "test@example.com".  It also only works when the system is running.

You can also use any of the following to manually test API endpoints:

* [Postman](https://www.postman.com/)
* `curl`
