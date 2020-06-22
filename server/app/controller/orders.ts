import { Request, Response, Router, NextFunction } from "express";
import { Order } from "../entities/Order";
import { getRepository } from "typeorm";
import OrderNotFoundException from "../exceptions/OrderNotFoundException";
import CannotCreateOrderException from "../exceptions/CannotCreateOrderException";
import HttpException from "../exceptions/HttpException";
import CannotUpdateOrderException from "../exceptions/CannotUpdateOrderException";
import orderValidation from "../middleware/orderValidation";
import { OrderDetail } from "../entities/OrderDetail";
import OrderDetailController from "./orderDetails";
import nonRequestOrderDetailValidation from "../middleware/nonRequestOrderDetailValidation";
import { ValidationError } from "class-validator";

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
        const orderDetailData: OrderDetail = request.body.orderDetail;
        const newOrder = this.orderRepository.create(orderData);

        this.orderRepository.save(newOrder)
            .then((result: Order) => {
                if (orderDetailData) {
                    orderDetailData.orderID = result.orderID;
                    orderDetailData.totalPrice = 0.00;
                    nonRequestOrderDetailValidation(OrderDetail, orderDetailData)
                        .then((vErrors) => {
                            if (vErrors.length > 0) {
                                // created an order but details has issues
                                response.send({
                                    order: result,
                                    orderDetails: [],
                                    error: vErrors.map((error: ValidationError) => Object.values(error.constraints)).join(", ")
                                });
                            } else {
                                const od: OrderDetailController = new OrderDetailController();
                                od.createOrderDetailWithNewOrder({
                                    orderID: result.orderID,
                                    orderTypeID: orderDetailData.orderTypeID,
                                    price: orderDetailData.price,
                                    orderDatetime: orderDetailData.orderDatetime || new Date(),
                                    quantityBought: orderDetailData.quantityBought,
                                    totalPrice: orderDetailData.quantityBought * orderDetailData.price,
                                    orderStatusID: orderDetailData.orderStatusID
                                })
                                    .then((odResult: OrderDetail) => {
                                        // created an order with corresponding details
                                        response.send({
                                            order: result,
                                            orderDetails: odResult,
                                            error: ""
                                        });
                                    })
                                    .catch((err) => {
                                        // created an order but saving details has issues
                                        response.send({
                                            order: result,
                                            orderDetails: [],
                                            error: vErrors.map((error: ValidationError) => Object.values(error.constraints)).join(", ")
                                        });
                                    });
                            }
                        });
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

    /* TODO: update an order will really only create a corresponding orderDetail row */
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