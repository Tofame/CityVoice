# 🏙️ CityVoice

**CityVoice** is a web platform that enables city residents to vote on and support local projects that shape their community.
It fosters engamenet and awareness of the townsfolk about how their city prospers and progresses.

---

## 🌟 Features

- 🗳️ **User Registration & Authentication**  
  Secure sign-up/login using JWT-based token system.

- 📢 **Projects Voting (WIP, Not implemented yet)**  
  Authenticated users can vote on proposed city improvement projects.

- 🔍 **Projects Browsing (WIP – Not implemented yet)**  
  Panel filled with projects with assistance of many filters like project status, will allow
  residents to easily stay up-to-date on how the city changes.

- 📨 **Newsletter Subscription**  
  Users can subscribe to updates and notifications about new initiatives.

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
- JWT secret key is *currently* not so secret, I will move it (make new one) to .env when it's production and not development.
- Currently I use local database with connection string being straight in DB class. This also will be .env or settings file.
- The local database I use is on port 3306, localhost, setup with XAMPP, but can be anything.
- When run, the app is set to run on port 8080, e.g. http://localhost:8080/?#
