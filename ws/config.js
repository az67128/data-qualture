const config = {
  fileSizeLimit: "2mb",
  db: {
    host: "",
    user: "",
    database: "",
    password: "",
    port: 5432,
    ssl: true,
  },
  token: {
    secret: "",
    accessTokenExpiresIn: 300,
    refreshTokenExpiresIn: "60d",
  },
  schedule: {
    interval: 1000 * 60 * 6,
  },
  email: {
    smtp: {
      host: "",
      port: 465,
      secure: true,
      auth: {
        user: "",
        pass: "",
      },
    },
    from: '"Data Quality Team" <dq@yourhost.com>',
    startHour: 15,
    startMinute: 33,
    systemUrl: "https://yourhost.com",
  },
  cors: {
    allowedOrigin: ["https://yourhost.com", "https://yourananotherhost.com"],
  },
};

module.exports = config;
