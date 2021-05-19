const schemaValidator = require('../../../app/middlewares/schemaValidator');
const lotteryStatus = require('../../../app/validationSchemas/lotteryStatus');


describe('schemaValidator middleware',  () => {

    it('should call next function if the schema validation passes', () => {
        const validator = schemaValidator(lotteryStatus);

        const req = { body: {
            lotteryTicket: {
                drawDate: '2021-05-15',
                picks: [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 20]],
            }
        }};
        const res = { json: jest.fn() }
        const next = jest.fn();

        validator(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('should call res.status with 422 if schema validation fails', () => {
        const validator = schemaValidator(lotteryStatus);

        const req = { body: {
            lotteryTicket: {
                drawDate: '2021-05-yy',
                picks: [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 20]],
            }
        }};
        const res = {
            status: jest.fn().mockReturnValue({send: () => {}})
        };
        const next = jest.fn();

        validator(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
    });

    it('should call next function if the schema validation is not applicable', () => {

        const schema = { body: null }

        const validator = schemaValidator(schema);

        const req = {};
        const res = { json: jest.fn() }
        const next = jest.fn();

        validator(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});