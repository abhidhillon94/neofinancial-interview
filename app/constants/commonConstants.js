/**
 * All the app wide constants are put here.
 * can be split into multiple files like validation constants, dateTime constants 
 * with futher development in future
 */

const WHITE_BALL_MIN_LIMIT = 1;
const WHITE_BALL_MAX_LIMIT = 69;
const RED_BALL_MIN_LIMIT = 1;
const RED_BALL_MAX_LIMIT = 26;
const VALID_PICK_LENGTH = 6;

const DAYS_OF_WEEK = {
    WEDNESDAY: 3,
    SATURDAY: 6,
};

MAX_ALLOWED_PICKS = 10;

module.exports = {
    WHITE_BALL_MAX_LIMIT,
    WHITE_BALL_MIN_LIMIT,
    RED_BALL_MAX_LIMIT,
    RED_BALL_MIN_LIMIT,
    VALID_PICK_LENGTH,
    DAYS_OF_WEEK,
    MAX_ALLOWED_PICKS,
};
