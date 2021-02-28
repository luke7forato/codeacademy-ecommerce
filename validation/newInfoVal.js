const Joi = require('joi');


const newInfoValidation = data => {
    const regSchema = Joi.object({
        name: Joi.string().min(6).max(150),
        email: Joi.string().min(6).email(),
        password: Joi.string().min(6),
    })

    const { error } = regSchema.validate(data)
    if(error) return error;
    return
}


module.exports = newInfoValidation;