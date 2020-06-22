import { Request, Response, Router, NextFunction } from "express";
import { Order } from "../entities/Order";
import { getRepository } from "typeorm";
import OrderNotFoundException from "../exceptions/OrderNotFoundException";
import CannotCreateOrderException from "../exceptions/CannotCreateOrderException";
import HttpException from "../exceptions/HttpException";
import CannotUpdateOrderException from "../exceptions/CannotUpdateOrderException";
import orderValidation from "../middleware/orderValidation";
import { OrderDetail } from "../entities/OrderDetail";

/***
 * TODO: Actually work on this class... right now it's not really used
 * */
class OrderDetailController {
    public path = "/order/detail";
    public router = Router();
    private orderDetailRepository = getRepository(OrderDetail);

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(this.path, this.getAllOrderDetails);
        this.router.get(`${this.path}/:id`, this.getOrderDetailById);
        this.router.post(this.path, orderValidation(Order), this.createOrderDetail);
    }

    private getAllOrderDetails = (request: Request, response: Response) => {
        this.orderDetailRepository.find({ relations: ["order"] })
            .then((orderDetails: OrderDetail[]) => {
                response.send(orderDetails);
            });
    };

    private getOrderDetailById = (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        this.orderDetailRepository.findOne(id)
            .then((result: OrderDetail) => {
                console.log(result);
                result ? response.send(result) : next(new OrderNotFoundException(id));
            })
            .catch((err) => {
                next(new HttpException(404, err));
            });
    };

    /* TODO: Implement */
    private getOrderDetailsByOrderId = (request: Request, response: Response, next: NextFunction) => {
        // const id = request.params.id;
        // this.orderDetailRepository.findOne(id)
        //     .then((result: OrderDetail) => {
        //         console.log(result);
        //         result ? response.send(result) : next(new OrderNotFoundException(id));
        //     })
        //     .catch((err) => {
        //         next(new HttpException(404, err));
        //     });
    };

    private createOrderDetail = (request: Request, response: Response, next: NextFunction) => {
        const orderData: Order = request.body;
        const newOrderDetail = this.orderDetailRepository.create(orderData);

        this.orderDetailRepository.save(newOrderDetail)
            .then((result: OrderDetail) => {
                response.send(result);
            })
            .catch((err) => {
                next(new CannotCreateOrderException(err));
            });
    };

    /* public methods? */
    public createOrderDetailWithNewOrder = (orderDetail: OrderDetail): Promise<OrderDetail> => {
        const newOrderDetail = this.orderDetailRepository.create(orderDetail);

        return this.orderDetailRepository.save(newOrderDetail);
            // .then((result: OrderDetail) => {
            //     response.send(result);
            // })
            // .catch((err) => {
            //     next(new CannotCreateOrderException(err));
            // });
    };
}

export default OrderDetailController;