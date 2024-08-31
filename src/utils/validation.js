import {log} from 'console';
import express from 'express';
import {body, validationResult} from 'express-validator';
import {EntityError, ErrorWithStatus} from '~/models/Errors';

// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation) => {
    return async (req, res, next) => {
        await validation.run(req);
        const errors = validationResult(req);
        // If there are no errors, continue with the request
        if (errors.isEmpty()) {
            return next();
        }

        const errorsObject = errors.mapped();
        const entityError = new EntityError({errors: {}});
        console.log('errorsObject', errorsObject);

        for (const key in errorsObject) {
            const {msg} = errorsObject[key];
            // Return errors that are not validation errors
            if (msg instanceof ErrorWithStatus && msg.status !== 422) {
                return next(msg);
            }
            entityError.errors[key] = errorsObject[key];
        }

        next(entityError);
    };
};
