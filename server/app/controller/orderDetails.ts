import { Request, Response, Router, NextFunction } from "express";
import { Order } from "../entities/Order";
import { getRepository } from "typeorm";
import HttpException from "../exceptions/HttpException";
import { OrderDetail } from "../entities/OrderDetail";
import nonRequestOrderDetailValidation from "../middleware/validations/nonRequestOrderDetailValidation";
import { ValidationError } from "class-validator";
import { OrderDetailUtility } from "../middleware/objectUtilities/orderDetailUtility";
import CannotCreateOrderDetailException from "../exceptions/orderDetail/CannotCreateOrderDetailException";
import CannotFindOrderDetailsWithOrderException
    from "../exceptions/orderDetail/CannotFindOrderDetailsWithOrderException";
import IOrderResponse from "../structure/IOrderResponse";
import OrderDetailNotFoundException from "../exceptions/orderDetail/OrderDetailNotFoundException";

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
                result ? response.send(result) : next(new OrderDetailNotFoundException(id));
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
     * Better... but still not my favorite location
     *
     *  Can we plug this into a utility... maybe we'll create an actual class...
     ***/
    public createOrderDetailWithNewOrder = async (order: Order, orderDetail: OrderDetail, currentIOResponse: IOrderResponse): Promise<IOrderResponse> => {
        orderDetail = OrderDetailUtility.setNewOrderDetailValues(order, orderDetail);
        const vErrors: ValidationError[] = await nonRequestOrderDetailValidation(OrderDetail, orderDetail);
        if (vErrors.length > 0) {
            // created an order but details has constraint issues
            currentIOResponse.error = vErrors.map((error: ValidationError) => Object.values(error.constraints)).join(", ");
        } else {
            orderDetail.totalPrice = OrderDetailUtility.getOrderDetailTotalPrice(orderDetail);
            const newOrderDetail = this.orderDetailRepository.create(orderDetail);
            try {
                const odResult: OrderDetail = await this.orderDetailRepository.save(newOrderDetail);
                currentIOResponse.orderDetails.push(odResult);
            } catch (e) {
                // created an order but details has field value issues
                currentIOResponse.error = `Order Detail: ${e.message}`;
            }
        }
        return currentIOResponse;
    }
}

export default OrderDetailController;