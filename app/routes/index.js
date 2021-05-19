const express = require('express')
const { root } = require('../controllers/root')
const { notFound } = require('../controllers/notfound')
const { getLotteryStatus } = require('../controllers/lotteryController')

const schemaValidator = require('../middlewares/schemaValidator');
const {lotteryStatus} = require('../validationSchemas');

const router = express.Router();

// Routes
router.get('/', root)
router.get('/lotteryStatus', schemaValidator(lotteryStatus), getLotteryStatus);

// Fall Through Route
router.use(notFound)

module.exports = router
