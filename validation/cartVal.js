const Joi = require('joi');



const cartValidation = data => {
    const prodSchema = Joi.object({
        name: Joi.string().min(4).max(150).required(),
        quantity: Joi.number().positive().required(),
    })

    const { error } = prodSchema.validate(data)
    if(error) return error;
    return
}

module.exports = cartValidation;