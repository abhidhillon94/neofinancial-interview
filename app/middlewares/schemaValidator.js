const Ajv = require('ajv');
const moment = require('moment');
const errorConstants = require('../constants/errorConstants');

/**
 * performs validation on ajv schema, expects the schema wrapped in body key
 * @param {*} ajv validation schema object with request body
 * @returns function which can be used as a middleware and performs validation on provided schema
 */
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

        // schema is always wrapped in body key to allow extending validation schemas for request query and url params
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
