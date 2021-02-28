const Joi = require('joi');

const loginValidation = data => {
    const logSchema = Joi.object({
        name: Joi.string().min(6).max(150),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    })

    const { error } = logSchema.validate(data)
    if(error) return error;
    return
}

module.exports = loginValidation;