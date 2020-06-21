import { ConnectionOptions } from "typeorm";
import { env_config } from "./config/env_config";

// set via docker-compose
const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME
} = process.env;

const ormDBConfig: ConnectionOptions = {
    type: "mysql",
    host: DB_HOST || env_config.host,
    port: Number(DB_PORT) || 3306,
    username: DB_USER || env_config.user,
    password: DB_PASSWORD || env_config.password,
    database: DB_NAME || env_config.database,
    entities: [
        __dirname + "/app/entities/*{.ts,.js}",
    ],
    synchronize: true,
};

export default ormDBConfig;