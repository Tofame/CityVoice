# 🏙️ CityVoice

**CityVoice** is a web platform that enables city residents to vote on and support local projects that shape their community.
It fosters engamenet and awareness of the townsfolk about how their city prospers and progresses.

The project is deployed on [Render](https://render.com/) service, which allows free hosting of such apps to get a preview.
The link to the hosted version of CityVoice here - [click](https://cityvoice-9uwx.onrender.com/)

(Images at the bottom)
[Go to images](#images)

---

## 🌟 Features

- 🗳️ **User Registration & Authentication**  
  Secure sign-up/login using JWT-based token system.

- 🛡️ **Admin Panel**
  Admin Panel usable only by authorized users. Allows for management of users and projects posted.

- 📨 **Newsletter Subscription**  
  Users can subscribe to updates and notifications about new initiatives.

- 🔍 **Projects Browsing**  
  Panel filled with projects with assistance of many filters like project status, will allow
  residents to easily stay up-to-date on how the city changes.

- 📢 **Projects Voting**  
  Authenticated users can vote on proposed city improvement projects.
  The vote can be either positive (upvote) or negative (downvote). It is possible to cancel/change assigned vote.

- 💬 **Project Comments**
  Besides voting on projects, each of the projects has a comment section, in which logged users can leave
  their opinions. For each posted comment, the author of the comment and site moderator/admin have ability to edit/remove them.

---

## 🧰 Tech Stack

### Frontend
- **HTML5**, **JavaScript**
- **Tailwind CSS** for responsive and modern design

### Backend
- **Go (Golang)**
- **JWT** for secure authentication
- RESTful API

## 📝 Current Implementation Details
- Added '.env' loading as well as '.env.dist', so you can use it as a template for '.env' file. 
- Currently in .env we expect JWT secret key (used for generating JWT auth tokens). You can generate your own using commented method in main.
  // fmt.Println(utils.GenerateRandomSecret())
- In .env we also expect a connection string to the database. In case it is missing in .env, it fallbacks to localhost on 3306, to db called 'cityvoice'.
  So you can e.g. setup such db on XAMPP (windows) or w/e locally.
- When run, the app is set to run on port 8080, e.g. http://localhost:8080/?#

## Images
<img src="https://github.com/user-attachments/assets/e0fc4ac1-ef5b-40b2-99d3-44762ffe09ea" width="400" alt="website 1"/>
<img width="400" alt="cityvoice_adminpanel" src="https://github.com/user-attachments/assets/78e804b8-bc44-436e-ba41-7310cdf043f4" />
<img width="400" alt="cityvoice_profile" src="https://github.com/user-attachments/assets/59ea0872-ddc8-4f31-abe2-c479cbdcf26f" />
<img width="400" alt="project_site" src="https://github.com/user-attachments/assets/1ae6e61b-fd4b-4ac5-adfd-1ce8e2ea75fb" />

## Dependencies

This project utilizes **Tailwind CSS locally** for styling. To set up and manage the CSS, follow these steps:

1.  **Install Node.js Dependencies:**
    Navigate to the project's root directory in your terminal and run the following command to install all required Node.js packages:

    ```bash
    npm install
    ```

2.  **Manage Tailwind CSS:**
    Once dependencies are installed, you can generate or update the project's compiled CSS file (`view/static/css/tailwindStyle.css`):

  * **Development Mode (Watch for Changes):**
    To automatically recompile CSS whenever you modify an HTML file open a separate terminal and run:

      ```bash
      npm run watch:css
      ```

  * **Production Build (One-time Compile & Optimize):**
    To generate a final, optimized, and minified CSS file (recommended before building your Go application for deployment):

      ```bash
      npm run build:css
      ```
