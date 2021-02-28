const Joi = require('joi');

const registrationValidation = data => {
    const regSchema = Joi.object({
        name: Joi.string().min(6).max(150),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
    })

    const { error } = regSchema.validate(data)
    if(error) return error;
    return
}

module.exports = registrationValidation;