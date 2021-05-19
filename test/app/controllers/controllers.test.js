const { root } = require('../../../app/controllers/root')
const { notFound } = require('../../../app/controllers/notfound')
const { getLotteryStatus } = require('../../../app/controllers/lotteryController')
const lotteryService = require('../../../app/services/LotteryService');
const validationService = require('../../../app/services/validationService');

describe('controllers test', () => {

    test('Hello World Controller', () => {
        const res = { json: jest.fn() }
        root({}, res)
        expect(res.json.mock.calls[0][0]).toEqual({ message: "Hello World" })
    })
      
    test('Not Found Route', () => {
        expect(notFound).toThrow("Route Not Found")
    })

    describe('Lottery Controller', () => {

        let validatePicksMock;
        beforeEach(() => {
            validatePicksMock = jest.spyOn(validationService, 'validatePicks').mockReturnValue(null);
        });

        afterEach(() => {
            lotteryService.getLotteryStatus.mockRestore();
            validationService.validatePicks.mockRestore();
        });

        it('should call getLotteryStatusByPicks with picks and draw date from request', async () => {
            const picks = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12]];
            const drawDate = '2021-05-14';

            const res = { json: jest.fn() }
            jest.spyOn(lotteryService, 'getLotteryStatus').mockReturnValue(new Promise((res, rej) => {
                res({});
            }));

            await getLotteryStatus({
                body: {
                    lotteryTicket: { picks, drawDate },
                }
            }, res);
            
            expect(lotteryService.getLotteryStatus).toHaveBeenCalledTimes(1);
            expect(lotteryService.getLotteryStatus).toHaveBeenCalledWith(picks, drawDate);
        });

        it('should return the result of getLotteryStatusByPicks function wrapped in lotteryStatus key', async () => {
            const picks = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12]];
            const drawDate = '2021-05-14';

            const getLotteryStatusReturnValue = {
                pickAndPrizeMaps: [
                    {pick: picks[0], prizeAmount: 1, isWin: true},
                    {pick: picks[1], prizeAmount: 2, isWin: true},
                ],
                totalPrize: 3,
            }

            const res = { json: jest.fn() }
            jest.spyOn(lotteryService, 'getLotteryStatus').mockReturnValue(
                new Promise((res, rej) => {
                    res(getLotteryStatusReturnValue);
                })
            );

            await getLotteryStatus({body: { lotteryTicket: { picks, drawDate } }}, res);
            
            expect(res.json.mock.calls[0][0]).toEqual({lotteryStatus: getLotteryStatusReturnValue});
        });

        it('should return unprocessable entity error if validation fails', async () => {
            const picks = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12]];
            const drawDate = '2021-05-14';

            const getLotteryStatusReturnValue = {
                pickAndPrizeMaps: [
                    {pick: picks[0], prizeAmount: 1, isWin: true},
                    {pick: picks[1], prizeAmount: 2, isWin: true},
                ],
                totalPrize: 3,
            }

            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnValue({
                    send: jest.fn(),
                })
            };
            jest.spyOn(lotteryService, 'getLotteryStatus').mockReturnValue(
                new Promise((res, rej) => {
                    res(getLotteryStatusReturnValue);
                })
            );

            const validationError = { message: 'Invalid whiteball number in pick', code: 'SOME_CODE' };
            validatePicksMock.mockReturnValue(validationError);

            await getLotteryStatus({body: { lotteryTicket: { picks, drawDate } }}, res);

            expect(res.status.mock.calls[0][0]).toBe(422);
        });
    })
})
