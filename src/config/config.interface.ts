/** Données de configuration de l'application */
export interface IAppConfig {
	name: string;
	env: string;
}

/** Configuration du serveur */
export interface IServerConfig {
	port: number;
	host: string;
}

/** Données de configuration du serveur */
export interface IDatabaseConfig {
	host: string;
	port: number;
	name: string;
	user: string;
	password: string;
}

/** Données de configuration du logger */
export interface ILoggerConfig {
	level: string;
}

/** Schéma des données attendus dans le fichier de configuration */
export interface IConfiguration {
	app: IAppConfig;
	server: IServerConfig;
	database: IDatabaseConfig;
	logger: ILoggerConfig;
}
