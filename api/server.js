const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const KnexSessionStorage = require('connect-session-knex')(session); // for storing sessions in DB

const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');
const knexConnection = require('../database/dbConfig.js');

const server = express();

const sessionConfiguration = {
  // default name is sid
  name: 'lambda',
  secret: process.env.COOKIE_SECRET || 'secret?',
  cookie: {
    maxAge: 1000 * 60 * 60, //valid for 1 hour (in milliseconds)
    secure: process.env.NODE_ENV === 'development' ? false : true, // do we send cookie over https only?
    httpOnly: true // prevent client Javascript code from accessing the cookie
  },
  resave: false, // save sessions even when they have not changed
  saveUninitialized: true,
  store: new KnexSessionStorage({
    knex: knexConnection,
    clearInterval: 1000 * 60 * 10, //delete expired sessions every 10 minutes
    tablename: 'user_sessions',
    sidfieldname: 'id',
    createtable: true
  })
};

server.use(helmet());
server.use(express.json());
server.use(cors()); // research 'creds: true' and 'withCredentials' when connecting from your react app
server.use(session(sessionConfiguration));

server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);

server.get('/', (req, res) => {
  res.json({ api: 'up', session: req.session });
});

module.exports = server;
