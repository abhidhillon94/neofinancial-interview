const validationService = require("../../../app/services/validationService");
const errorConstants = require("../../../app/constants/errorConstants");

describe('validationService tests', () => {

    describe('validatePicks', () => {

        it('should return null if all the picks in input are valid', () => {

            const picks = [[1, 2, 3, 4, 5, 6], [ 39, 69, 37, 10, 4, 24]];
            const result = validationService.validatePicks(picks);
            expect(result).toBe(null);
        });
    
        it('should return error with code and message if any white ball is invalid', () => {
    
            const picks = [[1, 2, 3, 4, 5, 6], [ 39, 69, 71, 10, 4, 24]];
            const result = validationService.validatePicks(picks);
            expect(result).toEqual({
                code: errorConstants.ERROR_VALIDATION_FAILED,
                message: 'Invalid whiteball number in pick',
            });
        });
    
        it('should return error with code and message if any red ball is invalid', () => {
    
            const picks = [[1, 2, 3, 4, 5, 6], [ 39, 69, 4, 10, 4, 30],];
            const result = validationService.validatePicks(picks);
            expect(result).toEqual({
                code: errorConstants.ERROR_VALIDATION_FAILED,
                message: 'Invalid redball number in pick',
            });
        });
    });
});