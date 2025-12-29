const express = require('express');
const xss = require('xss-clean');
const rateLimiting = require('express-rate-limit');
const cors = require("cors");
const hpp = require("hpp");
const helmet = require("helmet");
const connectToDb = require('./config/connectToDb');
const { verifyToken } = require('./middlewares/verifyToken');
const { errorhandler, notFound } = require('./middlewares/error');

require('dotenv').config();

const app = express();

app.set("trust proxy", 1);

app.use(express.json());

// DB
connectToDb();

// security
app.use(xss());
app.use(helmet());
app.use(hpp());

// rate limit
app.use(rateLimiting({
  windowMs: 10 * 60 * 1000,
  max: 20,
}));

// cors
app.use(cors({
  origin: process.env.CLIENT_DOMAIN,
}));

// routes
app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", verifyToken, require("./routes/usersRoute"));
app.use("/api/posts", verifyToken, require("./routes/postRoute"));
app.use("/api/comments", verifyToken, require("./routes/commentRoute"));
app.use("/api/categories", verifyToken, require("./routes/categoriesRoute"));
app.use("/api/password", require("./routes/passwordRoute"));

// errors
app.use(notFound);
app.use(errorhandler);

module.exports = app;
