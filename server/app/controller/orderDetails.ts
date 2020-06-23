import { Request, Response, Router, NextFunction } from "express";
import { Order } from "../entities/Order";
import { getRepository } from "typeorm";
import OrderNotFoundException from "../exceptions/order/OrderNotFoundException";
import HttpException from "../exceptions/HttpException";
import { OrderDetail } from "../entities/OrderDetail";
import nonRequestOrderDetailValidation from "../middleware/validations/nonRequestOrderDetailValidation";
import { ValidationError } from "class-validator";
import { OrderDetailUtility } from "../middleware/objectUtilities/orderDetailUtility";
import CannotCreateOrderDetailException from "../exceptions/orderDetail/CannotCreateOrderDetailException";
import CannotFindOrderDetailsWithOrderException
    from "../exceptions/orderDetail/CannotFindOrderDetailsWithOrderException";

class OrderDetailController {
    public path = "/order/:orderId/detail";
    public router = Router();
    private orderDetailRepository = getRepository(OrderDetail);

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(this.path, this.getOrderDetailsByOrderId);
        this.router.get(`${this.path}/:id`, this.getOrderDetailById);
        this.router.post(this.path, this.createOrderDetail);
    }

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

    private getOrderDetailsByOrderId = (request: Request, response: Response, next: NextFunction) => {
        const orderId = request.params.orderId;
        this.orderDetailRepository.createQueryBuilder("orderDetails")
            .where({
                orderID: orderId
            })
            .getMany()
            .then((result: OrderDetail[]) => {
                result.length > 0 ? response.send(result) : next(new CannotFindOrderDetailsWithOrderException(orderId));
            })
            .catch((err) => {
                next(new HttpException(404, err));
            });
    };

    private createOrderDetail = (request: Request, response: Response, next: NextFunction) => {
        let orderDetail: OrderDetail = request.body;
        orderDetail = OrderDetailUtility.setNewOrderDetailValues(undefined, orderDetail);
        if (orderDetail.orderID === undefined) {
            next(new CannotCreateOrderDetailException("Missing Order ID"));
        } else {
            nonRequestOrderDetailValidation(OrderDetail, orderDetail)
                .then((vErrors) => {
                    if (vErrors.length > 0) {
                        response.send(
                            next(
                                new CannotCreateOrderDetailException(
                                    vErrors.map((error: ValidationError) => Object.values(error.constraints)).join(", ")
                                )
                            )
                        );
                    } else {
                        orderDetail.totalPrice = OrderDetailUtility.getOrderDetailTotalPrice(orderDetail);
                        const newOrderDetail = this.orderDetailRepository.create(orderDetail);
                        this.orderDetailRepository.save(newOrderDetail)
                            .then((result: OrderDetail) => {
                                response.send(result);
                            })
                            .catch((err) => {
                                next(new CannotCreateOrderDetailException(err));
                            });
                    }
                });
        }
    };

    /* public methods? */
    /***
     * Not sure this is how I want this to work, by passing in a response object, but we'll see
     *
     * Idea Update: 6/23/2020:
     *  - Remove response param
     *  - Return the object/interface
     *  ---- Create an interface: IOrderResponse {order, orderDetails, orderNotes, error}
     *  - I think it'll need to be async and each place it's used will need to be await <>
     *  - See if we can't plug this into a utility... maybe we'll create an actual class...
     ***/
    public createOrderDetailWithNewOrder = (order: Order, orderDetail: OrderDetail, response: Response) => {
        if (orderDetail === undefined) {
            response.send({
                order: order,
                orderDetails: [],
                error: ""
            });
        } else {
            orderDetail = OrderDetailUtility.setNewOrderDetailValues(order, orderDetail);
            nonRequestOrderDetailValidation(OrderDetail, orderDetail)
                .then((vErrors) => {
                    if (vErrors.length > 0) {
                        // created an order but details has issues
                        response.send({
                            order: order,
                            orderDetails: [],
                            error: vErrors.map((error: ValidationError) => Object.values(error.constraints)).join(", ")
                        });
                    } else {
                        orderDetail.totalPrice = OrderDetailUtility.getOrderDetailTotalPrice(orderDetail);
                        const newOrderDetail = this.orderDetailRepository.create(orderDetail);
                        this.orderDetailRepository.save(newOrderDetail)
                            .then((odResult: OrderDetail) => {
                                // created an order with corresponding details
                                response.send({
                                    order: order,
                                    orderDetails: odResult,
                                    error: ""
                                });
                            })
                            .catch((err) => {
                                // created an order but saving details has issues
                                response.send({
                                    order: order,
                                    orderDetails: [],
                                    error: err
                                });
                            });
                    }
                });
        }
    }
}

export default OrderDetailController;