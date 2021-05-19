const commonConstants = require("../constants/commonConstants");
const errorConstants = require("../constants/errorConstants");

class ValidationService {

    validatePicks = (picks) => {

        for (const pick of picks) {

            for (let index = 0; index <= pick.length - 2; index++) {
                if (
                    pick[index] < commonConstants.WHITE_BALL_MIN_LIMIT ||
                    pick[index] > commonConstants.WHITE_BALL_MAX_LIMIT
                ) {
                    return {
                        message: 'Invalid whiteball number in pick',
                        code: errorConstants.ERROR_VALIDATION_FAILED,
                    }
                }
            }

            if (
                pick[pick.length - 1] < commonConstants.RED_BALL_MIN_LIMIT ||
                pick[pick.length - 1] > commonConstants.RED_BALL_MAX_LIMIT
            ) {
                return {
                    message: 'Invalid redball number in pick',
                    code: errorConstants.ERROR_VALIDATION_FAILED,
                }
            }
        }

        return null;
    }
}

module.exports = new ValidationService();
