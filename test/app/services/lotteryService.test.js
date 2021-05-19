const drawDatesService = require("../../../app/services/DrawDatesService");
const lotteryService = require("../../../app/services/lotteryService");

describe('LotteryService tests', () => {

    describe('generateMatchingBallsToPrizeRulesMap', () => {

        it('should call getPrizeAmountForPick function with all the picks, drawDates and ' +
            'result of getDrawDateAndNumbersMap', async (
        ) => {
            const getDrawDateAndNumbersMapResult = {
                '2021-05-17': {1: 1, 2: 1, 3: 1, 5: 1, 6: 1, 15: 1},
                '2021-05-14': {1: 1, 7: 1, 4: 1, 5: 1, 6: 1, 13: 1},
            };

            const picks = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12]];
            const drawDate = '2021-05-14';
            const prizeAmountForPick1 = 2;
            const prizeAmountForPick2 = 0;

            jest.spyOn(drawDatesService, 'getDrawDateAndNumbersMap')
                .mockReturnValueOnce(new Promise((res, rej) => res(getDrawDateAndNumbersMapResult)));

            jest.spyOn(lotteryService, 'getPrizeAmountForPick')
                .mockReturnValueOnce(prizeAmountForPick1)
                .mockReturnValueOnce(prizeAmountForPick2);

            const result = await lotteryService.getLotteryStatus(picks, drawDate);

            expect(drawDatesService.getDrawDateAndNumbersMap).toHaveBeenCalledTimes(1);
            expect(lotteryService.getPrizeAmountForPick).toHaveBeenCalledTimes(2);

            expect(lotteryService.getPrizeAmountForPick.mock.calls[0][0]).toEqual(picks[0]);
            expect(lotteryService.getPrizeAmountForPick.mock.calls[0][1]).toBe(drawDate);
            expect(lotteryService.getPrizeAmountForPick.mock.calls[0][2]).toBe(getDrawDateAndNumbersMapResult);

            expect(lotteryService.getPrizeAmountForPick.mock.calls[1][0]).toEqual(picks[1]);
            expect(lotteryService.getPrizeAmountForPick.mock.calls[1][1]).toBe(drawDate);
            expect(lotteryService.getPrizeAmountForPick.mock.calls[1][2]).toBe(getDrawDateAndNumbersMapResult);

            expect(result).toEqual({
                pickAndPrizeMaps: [
                    {pick: picks[0], prizeAmount: prizeAmountForPick1, isWin: true},
                    {pick: picks[1], prizeAmount: prizeAmountForPick2, isWin: false},
                ],
                totalPrizeAmount: 2,
            });

            lotteryService.getPrizeAmountForPick.mockRestore();
            drawDatesService.getDrawDateAndNumbersMap.mockRestore();
        });
    })

    describe('getPrizeAmountByMatches', () => {

        beforeEach(() => jest.spyOn(lotteryService, 'getMatchingBallsToPrizeRulesMap').mockReturnValueOnce({
            '2-false': 456, '1-true': 234, '2-true': 123, '1-false': 10,
        }));
        afterEach(() => lotteryService.getMatchingBallsToPrizeRulesMap.mockRestore())

        it('should call getMatchingBallsToPrizeRulesMap function', () => {
            const whiteBallsMatchCount = 2;
            const isRedBallMatch = false;

            lotteryService.getPrizeAmountByMatches(whiteBallsMatchCount, isRedBallMatch);
            expect(lotteryService.getMatchingBallsToPrizeRulesMap).toHaveBeenCalledTimes(1);
        });

        it('should generate a key with logic: whiteBallsMatch-isRedBallMatch and '+
            'return the value of this key from result of getMatchingBallsToPrizeRulesMap function', (
        ) => {
            const whiteBallsMatchCount = 2;
            const isRedBallMatch = false;

            const result = lotteryService.getPrizeAmountByMatches(whiteBallsMatchCount, isRedBallMatch);
            expect(result).toBe(456);
        });
    })

    describe('getPrizeAmountForPick', () => {

        it('should return 0 if draw date is not part of drawDateAndNumbersMap', () => {
            const pick = [1, 2, 3, 4, 5, 6];
            const drawDate = '2021-05-15';
            const drawDateAndNumbersMap = {
                '2021-05-17': {
                    whiteBallsMap: {1: 1, 2: 1, 3: 1, 5: 1, 6: 1},
                    redBall: 15,
                },
                '2021-05-14': {
                    whiteBallsMap: {1: 1, 7: 1, 4: 1, 5: 1, 6: 1, 13: 1},
                    redBall: 13,
                },
            };

            const result = lotteryService.getPrizeAmountForPick(pick, drawDate, drawDateAndNumbersMap);

            expect(result).toBe(0);
        });

        it('should call getPrizeAmountByMatches with 0 and false when there are no '+
            'matches b/w picks number and winning numbers for draw date',
        () => {
            const pick = [7, 8, 9, 10, 11, 12];
            const drawDate = '2021-05-17';
            const drawDateAndNumbersMap = {
                '2021-05-17': {
                    whiteBallsMap: {1: 1, 2: 1, 3: 1, 5: 1, 6: 1},
                    redBall: 15,
                },
                '2021-05-14': {
                    whiteBallsMap: {1: 1, 7: 1, 4: 1, 5: 1, 6: 1, 13: 1},
                    redBall: 13,
                },
            };

            jest.spyOn(lotteryService, 'getPrizeAmountByMatches');

            lotteryService.getPrizeAmountForPick(pick, drawDate, drawDateAndNumbersMap);

            expect(lotteryService.getPrizeAmountByMatches).toHaveBeenCalledTimes(1);
            expect(lotteryService.getPrizeAmountByMatches).toHaveBeenCalledWith(0, false);

            lotteryService.getPrizeAmountByMatches.mockRestore();
        });

        it('should call getPrizeAmountByMatches with appropriate arguments for matching white and red balls',
        () => {
            const pick = [7, 8, 9, 2, 11, 15];
            const drawDate = '2021-05-17';
            const drawDateAndNumbersMap = {
                '2021-05-17': {
                    whiteBallsMap: {1: 1, 2: 1, 3: 1, 5: 1, 6: 1}, redBall: 15,
                },
                '2021-05-14': {
                    whiteBallsMap: {1: 1, 7: 1, 4: 1, 5: 1, 6: 1, 13: 1}, redBall: 13,
                },
            };

            jest.spyOn(lotteryService, 'getPrizeAmountByMatches').mockReturnValueOnce(1);

            lotteryService.getPrizeAmountForPick(pick, drawDate, drawDateAndNumbersMap);

            expect(lotteryService.getPrizeAmountByMatches).toHaveBeenCalledTimes(1);
            expect(lotteryService.getPrizeAmountByMatches).toHaveBeenCalledWith(1, true);

            lotteryService.getPrizeAmountByMatches.mockRestore();
        });

        it('should return the return value of getPrizeAmountByMatches function', () => {
            const pick = [7, 8, 9, 10, 11, 12];
            const drawDate = '2021-05-17';
            const drawDateAndNumbersMap = {
                '2021-05-17': {
                    whiteBallsMap: {1: 1, 2: 1, 3: 1, 5: 1, 6: 1}, redBall: 15,
                },
                '2021-05-14': {
                    whiteBallsMap: {1: 1, 7: 1, 4: 1, 5: 1, 6: 1, 13: 1}, redBall: 13,
                },
            };
            const matchingBallsToPrizeRulesMap = {
                '5-true': 2000000,
                '5-false': 1000000,
                '4-true': 50000,
                '4-false': 100,
                '3-true': 100,
                '3-false': 7,
                '2-true': 7,
                '1-true': 4,
                '0-true': 4
            };

            jest.spyOn(lotteryService, 'getMatchingBallsToPrizeRulesMap').mockReturnValueOnce(
                matchingBallsToPrizeRulesMap
            );
            jest.spyOn(lotteryService, 'getPrizeAmountByMatches').mockReturnValueOnce(111);

            const result = lotteryService.getPrizeAmountForPick(pick, drawDate, drawDateAndNumbersMap);

            expect(result).toBe(111);

            lotteryService.getMatchingBallsToPrizeRulesMap.mockRestore();
            lotteryService.getPrizeAmountByMatches.mockRestore();
        });
    })

    describe('getLotteryStatus', () => {

        const drawDate = '2021-05-17';
        const drawDateAndNumbersMap = {
            '2021-05-17': {
                whiteBallsMap: {1: 1, 2: 1, 3: 1, 5: 1, 6: 1}, redBall: 15,
            },
            '2021-05-14': {
                whiteBallsMap: {1: 1, 7: 1, 4: 1, 5: 1, 6: 1, 13: 1}, redBall: 13,
            },
        };

        it('should call getPrizeAmountForPick for each pick with pick, drawDate and result of getDrawDateAndNumbersMap',
        async () => {
            const picks = [[7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18]];

            jest.spyOn(drawDatesService, 'getDrawDateAndNumbersMap').mockReturnValueOnce(drawDateAndNumbersMap);
            jest.spyOn(lotteryService, 'getPrizeAmountForPick').mockReturnValue(1);

            await lotteryService.getLotteryStatus(picks, drawDate);

            expect(drawDatesService.getDrawDateAndNumbersMap).toHaveBeenCalledTimes(1);
            expect(lotteryService.getPrizeAmountForPick).toHaveBeenCalledTimes(2);

            // match the arguments of each mock function call
            expect(lotteryService.getPrizeAmountForPick.mock.calls[0][0]).toEqual(picks[0]);
            expect(lotteryService.getPrizeAmountForPick.mock.calls[0][1]).toBe(drawDate);
            expect(lotteryService.getPrizeAmountForPick.mock.calls[0][2]).toEqual(drawDateAndNumbersMap);

            expect(lotteryService.getPrizeAmountForPick.mock.calls[1][0]).toEqual(picks[1]);
            expect(lotteryService.getPrizeAmountForPick.mock.calls[1][1]).toBe(drawDate);
            expect(lotteryService.getPrizeAmountForPick.mock.calls[1][2]).toEqual(drawDateAndNumbersMap);

            drawDatesService.getDrawDateAndNumbersMap.mockRestore();
            lotteryService.getPrizeAmountForPick.mockRestore();
        });

        it('should return the generated pickAndPrizeMaps and ' +
            'sum of prizeAmount calculated from return value of getPrizeAmountForPick function',
        async () => {
            const picks = [[7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24]];
            const prizeAmountForPick1 = 3;
            const prizeAmountForPick2 = 0;
            const prizeAmountForPick3 = 2;

            jest.spyOn(drawDatesService, 'getDrawDateAndNumbersMap').mockReturnValueOnce(drawDateAndNumbersMap);
            jest.spyOn(lotteryService, 'getPrizeAmountForPick')
                .mockReturnValueOnce(prizeAmountForPick1)
                .mockReturnValueOnce(prizeAmountForPick2)
                .mockReturnValueOnce(prizeAmountForPick3);

            const result = await lotteryService.getLotteryStatus(picks, drawDate);

            expect(result).toEqual({
                pickAndPrizeMaps: [
                    {pick: picks[0], prizeAmount: prizeAmountForPick1, isWin: true},
                    {pick: picks[1], prizeAmount: prizeAmountForPick2, isWin: false},
                    {pick: picks[2], prizeAmount: prizeAmountForPick3, isWin: true}
                ],
                totalPrizeAmount: prizeAmountForPick1 + prizeAmountForPick2 + prizeAmountForPick3,
            })

            drawDatesService.getDrawDateAndNumbersMap.mockRestore();
            lotteryService.getPrizeAmountForPick.mockRestore();
        });
    })

});
