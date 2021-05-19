const commonConstants = require('../constants/commonConstants');

module.exports = {
    body: {
        type: 'object',
        required: ['lotteryTicket'],
        properties: {
            lotteryTicket: {
                type: 'object',
                required: ['drawDate', 'picks'],
                properties: {
                    drawDate: {
                        type: 'string',
                        format: 'date',
                        daysOfWeek: [commonConstants.DAYS_OF_WEEK.WEDNESDAY, commonConstants.DAYS_OF_WEEK.SATURDAY],
                    },
                    picks: { 
                        type: 'array',
                        maxItems: commonConstants.MAX_ALLOWED_PICKS,
                        minItems: 1,
                        items: {
                            type: "array",
                            minItems: 6,
                            maxItems: 6,
                            items: { type: 'number' }
                        }
                    }
                },
            },
            additionalProperties: false,
        },
        additionalProperties: false,
    }
}
