const {drawDatesService} = require('../app/services/DrawDatesService');
const lotteryService = require ('../app/services/LotteryService');

drawDatesService.fetchDrawDatesFromPublicApi().then((result) => {
    console.log({result});
});
