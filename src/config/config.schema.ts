import { IConfiguration } from "src/config/config.interface";

export default (): IConfiguration => ({
	app: {
		name: process.env.APP_NAME,
		env: process.env.APP_ENV,
	},
	server: {
		host: process.env.SERVER_HOST,
		port: parseInt(process.env.SERVER_PORT, 10),
	},
	database: {
		host: process.env.DATABASE_HOST,
		port: parseInt(process.env.DATABASE_PORT, 10),
		name: process.env.DATABASE_NAME,
		user: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASSWORD,
	},
	logger: {
		level: process.env.LOGGER_LEVEL,
	},
});
