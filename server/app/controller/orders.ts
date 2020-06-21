import { Request, Response, Router, NextFunction } from "express";
import { Order } from "../entities/Order";
import { getRepository } from "typeorm";
import OrderNotFoundException from "../exceptions/OrderNotFoundException";
import CannotCreateOrderException from "../exceptions/CannotCreateOrderException";
import HttpException from "../exceptions/HttpException";
import CannotUpdateOrderException from "../exceptions/CannotUpdateOrderException";
import orderValidation from "../middleware/orderValidation";

class OrderController {
    public path = "/order";
    public router = Router();
    private orderRepository = getRepository(Order);

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(this.path, this.getAllOrders);
        this.router.get(`${this.path}/:id`, this.getOrderById);
        this.router.post(this.path, orderValidation(Order), this.createOrder);
        this.router.put(`${this.path}/:id`, orderValidation(Order, true), this.updateOrder);
    }

    private getAllOrders = (request: Request, response: Response) => {
        this.orderRepository.find({ relations: ["orderDetails"] })
            .then((orders: Order[]) => {
                response.send(orders);
            });
    };

    private getOrderById = (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        this.orderRepository.findOne(id)
            .then((result: Order) => {
                console.log(result);
                result ? response.send(result) : next(new OrderNotFoundException(id));
            })
            .catch((err) => {
                next(new HttpException(404, err));
            });
    };

    private createOrder = (request: Request, response: Response, next: NextFunction) => {
        const orderData: Order = request.body;
        const newPost = this.orderRepository.create(orderData);

        this.orderRepository.save(newPost)
            .then((result: Order) => {
                response.send(result);
            })
            .catch((err) => {
                next(new CannotCreateOrderException(err));
            });
    };

    /* this will be re-worked when DB update happens */
    private updateOrder = (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        const orderData: Order = request.body;
        this.orderRepository.update(id, orderData)
            .then(() => {
                this.orderRepository.findOne(id)
                    .then((result: Order) => {
                        console.log(result);
                        result ? response.send(result) : next(new OrderNotFoundException(id));
                    })
                    .catch((err) => {
                        next(new HttpException(404, err));
                    });
            })
            .catch((err) => {
                next(new CannotUpdateOrderException(err));
            });
    }
}

export default OrderController;