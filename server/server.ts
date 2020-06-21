import App from "./app";
import OrderController from "./app/controller/orders";
import "reflect-metadata";
import { createConnection } from "typeorm";
import ormDBConfig from "./ormconfig";

createConnection(ormDBConfig)
    .then((conn) => {
        const app = new App(
            [
                new OrderController(),
            ],
            48614,
        );
        app.listen();
    })
    .catch((err) => {
        console.log("Error while connecting to the database", err);
        return err;
    });