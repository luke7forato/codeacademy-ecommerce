const Joi = require('joi');



const changeProductValidation = data => {
    const prodSchema = Joi.object({
        name: Joi.string().min(4).max(150).required(),
        newName: Joi.string().min(4).max(150).required(),
        newDescription: Joi.string().min(6).max(500).required(),
        newPrice: Joi.number().positive().required(),
    })

    const { error } = prodSchema.validate(data)
    if(error) return error;
    return
}

module.exports = changeProductValidation;