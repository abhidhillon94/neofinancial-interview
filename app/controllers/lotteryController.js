const lotteryService = require("../services/lotteryService");
const errorConstants = require("../constants/errorConstants");
const validationService = require('../services/validationService');

async function getLotteryStatus(req, res, next) {
    const err = validationService.validatePicks(req.body.lotteryTicket.picks);
    if (err) {
        return res.status(422).send({code: err.code, message: err.message});
    }

    const lotteryStatus = await lotteryService.getLotteryStatus(
        req.body.lotteryTicket.picks, req.body.lotteryTicket.drawDate,
    );
    return res.json({lotteryStatus});
}

module.exports = {
    getLotteryStatus,
}
