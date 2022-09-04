import Joi from 'joi';

const schemas = {
  POST_PCHECK: Joi.object().keys({
    createdids: Joi.array().items(Joi.object()).required(),
    finishids: Joi.array().items(Joi.object()).required(),
  }),
  POST_NOTIFYALL: Joi.object().keys({
    event: Joi.string(),
    message: Joi.string().required(),
    level: Joi.string().valid('INFO', 'WARN', 'ERROR'),
  }),
  POST_TIMEOUT: Joi.object().keys({
    duration: Joi.string().required(),
  }),
};

export default schemas;
