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
        // stores a prize matrix to get the prizeAmount for given combination of red and white balls match
        this.matchingBallsToPrizeRulesMap = this.generateMatchingBallsToPrizeRulesMap(prizeMatrix);
    }

    /**
     * getter for instance variables for easy unit testing
     * @returns {{matchingWhiteAndRedBall: number}} matchingBallsToPrizeRulesMap
     */
    getMatchingBallsToPrizeRulesMap = () => this.matchingBallsToPrizeRulesMap;

    /**
     * tests given picks and draw date for lottery win using data from drawDatesService
     * @param {number[]} picks 
     * @param {string} drawDate - UTC draw date in YYYY-MM-DD format
     * @returns {{pickAndPrizeMaps: {pick: number[], prizeAmount: number, isWin: boolean}, totalPrizeAmount: number}} lotteryStatus
     */
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

    /**
     * finds and returns prize amount for a given combination of pick, drawDate and dates with winning numbers data
     * @param {number[]} pick 
     * @param {string} drawDate - UTC date in YYYY-MM-DD format
     * @param {{date: { whiteBallsMap: {winningNumber: 1}, redBall: number }}} drawDateAndNumbersMap 
     * @returns {number} - prize amount in dollars
     */
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

    /**
     * finds prizeAmount from prizeRulesMap based on input params
     * @param {number} whiteBallsMatchCount
     * @param {boolean} isRedBallMatch
     * @returns {number} prizeAmount
     */
    getPrizeAmountByMatches = (whiteBallsMatchCount, isRedBallMatch) => {
        const matchingBallsToPrizeRulesMap = this.getMatchingBallsToPrizeRulesMap();
        return matchingBallsToPrizeRulesMap[`${whiteBallsMatchCount}-${isRedBallMatch}`] || 0;
    }

    /**
     * transforms human readable prize matrix to structure which can find prize maount in O(1) complexity
     * @param {{ whiteBallsMatchCount: number, isRedBallMatch: boolean, prizeAmount: number }} prizeMatrix 
     * @returns {{whiteBallMatchCountandIsRedBallMatch: number}} matchingBallsToPrizeRulesMap - key white and red ball match and value as dollar amount
     */
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
