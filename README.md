# Data Qualture
### Data quality tool

1. Allows you to automatically check your data quality.
2. Social. Each error has a responsible person.
3. Statistics and analytics.
4. Simple. Really simple.

#### Try [demo](https://0pnzxj1wjw.codesandbox.io/)

## Architecture
### Context Diagram
<img src="./docs/c1.svg">

### Container Diagram
<img src="./docs/c2.svg">

## Installation
### Database
Required PostreSQL^9.1
Execute sripts:
+ /db/createDb.sql
+ /db/data1.sql
+ /db/data2.sql
+ /db/data3.sql

### Web service
Required node^8

update /ws/config.js
```javascript
const config = {
  fileSizeLimit: "2mb",
  db: {
    host: "", // database host
    user: "", // database user
    database: "", // default database
    password: "", //database user password
    port: 5432,
    ssl: true,
  },
  token: {
    secret: "", // secret token for JWT generation
    accessTokenExpiresIn: 300, // access token life time
    refreshTokenExpiresIn: "60d", // refresh token expiration time
  },
  schedule: {
    interval: 1000 * 60 * 6, // query schedule checks interval
  },
  email: { // smtp for email notifications
    smtp: {
      host: "", 
      port: 465,
      secure: true,
      auth: {
        user: "",
        pass: "",
      },
    },
    from: '"Data Quality Team" <dq@yourhost.com>', // email for notifications 
    startHour: 15, // when to send notifictions, UTC 0
    startMinute: 33, // when to send notifictions, UTC 0
    systemUrl: "https://yourhost.com", // Link to your system. Used to make links in notifications 
  },
  cors: {
    allowedOrigin: ["https://yourhost.com", "https://yourananotherhost.com"], // allowed origins for web interface
  },
};
```
run commands
```
$ /ws/ npm install
$ /ws/ npm start
```

Next demonize node process. PM2 recommended

Reverse proxy required to host node.js application. Use nginx for linux systems. Use IIS if you need NTL windows authorization

### Web interface

update /web/src/constant/common.js
```javascript
***
export const WS_URL = "https://127.0.0.1:8080/"; // link to your web service
***
```
run commands
```
$ /web/ npm install
$ /web/ npm run build
```

Move files from /web/build to your web interface serverver

### Final touchapp
+ Open web interface
+ Create new user
+ Grant admin = true in database. Example:

```
Update person set is_administrator = true where email = 'admin@mail.com'
```




