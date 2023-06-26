const Joi = require("joi");

const configValidator = Joi.object({
	NODE_ENV: Joi.string().valid("development", "production", "test", "provision").default("development"),
	APP_NAME: Joi.string().default("souviensToi"),
	SERVER_HOST: Joi.string().default("localhost"),
	SERVER_PORT: Joi.number().default(8080),
	DATABASE_HOST: Joi.string().default("localhost"),
	DATABASE_PORT: Joi.number().default(5432),
	DATABASE_NAME: Joi.string().default("souviensToi"),
	DATABASE_USER: Joi.string().default("postgres"),
	DATABASE_PASSWORD: Joi.string().default("root"),
	LOGGER_LEVEL: Joi.string().valid("log", "error", "warn", "debug", "verbose").default("debug"),
});

export default configValidator;
