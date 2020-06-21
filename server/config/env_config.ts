/**
 * env_config.
 *
 * Revisions to this file should not be committed to the repository.
 */
const config = require("config");

export type MySQLConfig = {
    host: string,
    user: string,
    password: string,
    database: string
};

export let env_config: MySQLConfig = {
    host: config.get("host"),
    user: config.get("user"),
    password: config.get("password"),
    database: config.get("database")
};
