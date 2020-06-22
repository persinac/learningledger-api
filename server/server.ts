import App from "./app";
import OrderController from "./app/controller/orders";
import "reflect-metadata";
import { createConnection } from "typeorm";
import ormDBConfig from "./ormconfig";
import OrderDetailController from "./app/controller/orderDetails";

createConnection(ormDBConfig)
    .then((conn) => {
        const app = new App(
            [
                new OrderController(),
                new OrderDetailController()
            ],
            48614,
        );
        app.listen();
    })
    .catch((err) => {
        console.log("Error while connecting to the database", err);
        return err;
    });