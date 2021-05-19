const Ajv = require('ajv');
const moment = require('moment');
const errorConstants = require('../constants/errorConstants');

const validate = (schema) => {

    return async (req, res, next) => {

        const ajv = new Ajv({ allErrors: false, useDefaults: true });

        ajv.addFormat('date', {
            validate: (dateString) => {
                return moment(dateString, 'YYYY-MM-DD', true).isValid();
            },
        });

        ajv.addKeyword('daysOfWeek', {
            metaSchema: { type: 'array' },
            errors: true,
            validate: ((arrDaysOfWeek, dateString) => {
                const date = moment(dateString, 'YYYY-MM-DD', true);
                return arrDaysOfWeek.includes(date.isoWeekday());
            }),
        });

        if (schema.body) {
            const valid = ajv.validate(schema.body, req.body);
            if (!valid) {
                return res.status(422).send({
                    code: errorConstants.CODE_INVALID_INPUT,
                    message: `${ajv.errors[0].keyword} ${ajv.errors[0].message}`,
                });
            }
        }

        next();
    };
}

module.exports = validate;
