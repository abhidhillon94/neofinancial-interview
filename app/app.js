const express = require('express')
const routes = require('./routes')

// Create Express App
const app = express()

// Routes
app.use(express.json());
app.use('/', routes)

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send({
        message: 'Internal server error',
        error: err.stack, // do not return in production
    })
})

module.exports = app
