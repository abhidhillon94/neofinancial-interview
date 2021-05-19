const drawDatesService = require("./drawDatesService");

class LotteryService {

    static GRAND_PRIZE = 2000000;
    static DEFAULT_PRIZE_MATRIX = [
        { whiteBallsMatchCount: 5, isRedBallMatch: true, prizeAmount: LotteryService.GRAND_PRIZE },
        { whiteBallsMatchCount: 5, isRedBallMatch: false, prizeAmount: 1000000 },
        { whiteBallsMatchCount: 4, isRedBallMatch: true, prizeAmount: 50000 },
        { whiteBallsMatchCount: 4, isRedBallMatch: false, prizeAmount: 100 },
        { whiteBallsMatchCount: 3, isRedBallMatch: true, prizeAmount: 100 },
        { whiteBallsMatchCount: 3, isRedBallMatch: false, prizeAmount: 7 },
        { whiteBallsMatchCount: 2, isRedBallMatch: true, prizeAmount: 7 },
        { whiteBallsMatchCount: 1, isRedBallMatch: true, prizeAmount: 4 },
        { whiteBallsMatchCount: 0, isRedBallMatch: true, prizeAmount: 4 },
    ];

    constructor (prizeMatrix = LotteryService.DEFAULT_PRIZE_MATRIX) {
        this.matchingBallsToPrizeRulesMap = this.generateMatchingBallsToPrizeRulesMap(prizeMatrix);
    }

    getMatchingBallsToPrizeRulesMap = () => {
        return this.matchingBallsToPrizeRulesMap;
    }

    getLotteryStatus = async (picks, drawDate) => {

        const pickAndPrizeMaps = [];
        let totalPrizeAmount = 0;

        const drawDateAndNumbersMap = await drawDatesService.getDrawDateAndNumbersMap();

        picks.forEach(pick => {
            const prizeAmount = this.getPrizeAmountForPick(pick, drawDate, drawDateAndNumbersMap);
            totalPrizeAmount += prizeAmount;
            pickAndPrizeMaps.push({pick, prizeAmount, isWin: !!prizeAmount});
        });

        return {pickAndPrizeMaps, totalPrizeAmount};
    }

    getPrizeAmountForPick = (pick, drawDate, drawDateAndNumbersMap) => {

        if (!drawDateAndNumbersMap[drawDate]) {
            return 0;
        }

        let whiteBallsMatchCount = 0;

        for (let i = 0; i < pick.length - 1; i++) {
            if (drawDateAndNumbersMap[drawDate].whiteBallsMap[pick[i]]) {
                whiteBallsMatchCount += 1;
            }
        }

        const isRedBallMatch = pick[5] === drawDateAndNumbersMap[drawDate].redBall;
        return this.getPrizeAmountByMatches(whiteBallsMatchCount, isRedBallMatch);
    }

    getPrizeAmountByMatches = (whiteBallsMatchCount, isRedBallMatch) => {
        const matchingBallsToPrizeRulesMap = this.getMatchingBallsToPrizeRulesMap();
        return matchingBallsToPrizeRulesMap[`${whiteBallsMatchCount}-${isRedBallMatch}`] || 0;
    }

    generateMatchingBallsToPrizeRulesMap = (prizeMatrix) => {
        const matchingBallsToPrizeRulesMap = {};
        prizeMatrix.forEach((prizeMatrixElement) => {
            matchingBallsToPrizeRulesMap[
                `${prizeMatrixElement.whiteBallsMatchCount}-${prizeMatrixElement.isRedBallMatch}`
            ] = prizeMatrixElement.prizeAmount;
        });
        return matchingBallsToPrizeRulesMap;
    }

}

module.exports = new LotteryService();
