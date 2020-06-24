import { NextFunction, Request, Response, Router } from "express";
import { Order } from "../entities/Order";
import { getRepository } from "typeorm";
import OrderNotFoundException from "../exceptions/order/OrderNotFoundException";
import HttpException from "../exceptions/HttpException";
import CannotUpdateOrderException from "../exceptions/order/CannotUpdateOrderException";
import orderValidation from "../middleware/validations/orderValidation";
import { OrderDetail } from "../entities/OrderDetail";
import OrderDetailController from "./orderDetails";
import IOrderResponse from "../structure/IOrderResponse";
import IOrder from "../structure/Order";
import { OrderNote } from "../entities/OrderNotes";
import OrderNotesController from "./orderNotes";

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
        this.orderRepository.find({ relations: ["orderDetails", "orderNotes"] })
            .then((orders: Order[]) => {
                const iResponse: IOrderResponse[] = [];
                orders.forEach((o: Order) => {
                    const { orderID, stockID, commodityType, contractType } = o;
                    const iorder: IOrder = { orderID, stockID, commodityType, contractType };
                    iResponse.push(
                        {
                            order: iorder,
                            orderDetails: o.orderDetails,
                            orderNotes: o.orderNotes
                        }
                    );
                });
                response.send(iResponse);
            });
    };

    private getOrderById = (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        this.orderRepository.findOne(id, { relations: ["orderDetails", "orderNotes"] })
            .then((result: Order) => {
                let iResponse: IOrderResponse;
                const { orderID, stockID, commodityType, contractType } = result;
                const iorder: IOrder = { orderID, stockID, commodityType, contractType };
                iResponse = {
                    order: iorder,
                    orderDetails: result.orderDetails,
                    orderNotes: result.orderNotes
                };
                result ? response.send(iResponse) : next(new OrderNotFoundException(id));
            })
            .catch((err) => {
                next(new HttpException(404, err));
            });
    };

    private createOrder = async (request: Request, response: Response, next: NextFunction) => {
        const orderData: Order = request.body;
        const orderDetailData: OrderDetail = request.body.orderDetail;
        const orderNotesData: OrderNote = request.body.orderNotes;
        const newOrder = this.orderRepository.create(orderData);
        let iResponse: IOrderResponse = {};
        const result: Order = await this.orderRepository.save(newOrder);
        const { orderID, stockID, commodityType, contractType } = result;
        iResponse.order = {orderID, stockID, commodityType, contractType};
        if (orderDetailData) {
            const od: OrderDetailController = new OrderDetailController();
            iResponse.orderDetails = [];
            iResponse = await od.createOrderDetailWithNewOrder(result, orderDetailData, iResponse);
        }
        if (orderNotesData) {
            const on: OrderNotesController = new OrderNotesController();
            iResponse.orderNotes = [];
            iResponse = await on.createOrderNoteWithNewOrder(result, orderNotesData, iResponse);
        }
        response.send(iResponse);
    };

    /* Given the DB update, order won't really ever be updated. Only order details will be created */
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