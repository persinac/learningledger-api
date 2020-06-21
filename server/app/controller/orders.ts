import { Request, Response, Router } from "express";
import { Order } from "../entities/Order";
import { getRepository } from "typeorm";

class OrderController {
    public path = "/order";
    public router = Router();
    private orderRepository = getRepository(Order);

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(this.path, this.getAllOrders);
        this.router.post(this.path, this.createAnOrder);
    }

    private getAllOrders = async (request: Request, response: Response) => {
        const orders = await this.orderRepository.find();
        response.send(orders);
    };

    createAnOrder = (request: Request, response: Response) => {
        // const order: Order = request.body;
        // this.orders.push(order);
        // response.send(order);
    }
}

export default OrderController;