const Joi = require('joi');


const productsValidation = data => {
    const prodSchema = Joi.object({
        name: Joi.string().min(4).max(150).required(),
        description: Joi.string().min(6).max(500).required(),
        price: Joi.number().positive().required(),
    })

    const { error } = prodSchema.validate(data)
    if(error) return error;
    return
}

module.exports = productsValidation;