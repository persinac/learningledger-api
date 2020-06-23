import { Request, Response, Router, NextFunction } from "express";
import { Order } from "../entities/Order";
import { getRepository } from "typeorm";
import OrderNotFoundException from "../exceptions/order/OrderNotFoundException";
import CannotCreateOrderException from "../exceptions/order/CannotCreateOrderException";
import HttpException from "../exceptions/HttpException";
import CannotUpdateOrderException from "../exceptions/order/CannotUpdateOrderException";
import orderValidation from "../middleware/validations/orderValidation";
import { OrderDetail } from "../entities/OrderDetail";
import OrderDetailController from "./orderDetails";

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
        // this.router.put(`${this.path}/:id`, orderValidation(Order, true), this.updateOrder);
    }

    private getAllOrders = (request: Request, response: Response) => {
        this.orderRepository.find({ relations: ["orderDetails"] })
            .then((orders: Order[]) => {
                response.send(orders);
            });
    };

    private getOrderById = (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        this.orderRepository.findOne(id, { relations: ["orderDetails"] })
            .then((result: Order) => {
                result ? response.send(result) : next(new OrderNotFoundException(id));
            })
            .catch((err) => {
                next(new HttpException(404, err));
            });
    };

    private createOrder = (request: Request, response: Response, next: NextFunction) => {
        const orderData: Order = request.body;
        const orderDetailData: OrderDetail = request.body.orderDetail;
        const newOrder = this.orderRepository.create(orderData);

        this.orderRepository.save(newOrder)
            .then((result: Order) => {
                if (orderDetailData) {
                    const od: OrderDetailController = new OrderDetailController();
                    od.createOrderDetailWithNewOrder(result, orderDetailData, response);
                } else {
                    // created an order without details
                    response.send({
                        order: result,
                        orderDetails: [],
                        error: ""
                    });
                }
            })
            .catch((err) => {
                next(new CannotCreateOrderException(err));
            });
    };

    /* Given the DB update, order won't really ever be deleted. Only order details will be created */
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