// Define ErrorsType as a plain object with string keys and values that are objects

// Base ErrorWithStatus class
export class ErrorWithStatus {
    constructor({message, status}) {
        this.message = message;
        this.status = status;
    }
}

// Derived EntityError class
export class EntityError extends ErrorWithStatus {
    constructor({message = 'Validation error', errors}) {
        super({message, status: 422});
        this.errors = errors;
    }
}
