
# Stadium Booking
This project was made as a part of a personal project. The goal of this project is to 
learn session management, mysql integration to nodejs and custom made server side handling.


## ⚙ Features

- Log in as a normal user or a merchant.
- Store the session as a cookie.
- View and book available stadiums.
- View details about each stadiums such as available time slots.
- Add your own stadiums, if you are a merchant.


## 🔎 Tech Stack

**Client:** Written in Vanilla - Javascript, HTML, CSS, XHR.

**Server:** Written in Typescript with Node.js - Modular, Express.js, MySQL.


## 🎞 Deployment
In order to run this repo, you will need:
- Nodejs @ https://nodejs.org/en/download
- Mysql @ https://dev.mysql.com/downloads/installer/
    
## 🎨 Run Locally

Clone the project

```bash
  git clone https://github.com/Tryferos/Reservations
```

Go to the project directory

```bash
  cd my-project
```

Make sure you have nodejs installed.

Install all dependencies

```bash
  npm i
```

Start the server

```bash
  npm run start
```


## 🔐 Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file

MySQL Database credentials:

`DB_PASSWORD`
`DB_USER`
`DB_HOST`
`DB_PORT`

