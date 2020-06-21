import { ConnectionOptions } from "typeorm";
import { env_config } from "./config/env_config";

const ormDBConfig: ConnectionOptions = {
    type: "mysql",
    host: env_config.host,
    port: 3306,
    username: env_config.user,
    password: env_config.password,
    database: env_config.database,
    entities: [
        __dirname + "/app/entities/*{.ts,.js}",
    ],
    synchronize: true,
};

export default ormDBConfig;