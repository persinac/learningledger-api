import { Request, Response, Router, NextFunction } from "express";
import { Order } from "../entities/Order";
import { getRepository } from "typeorm";
import HttpException from "../exceptions/HttpException";
import nonRequestOrderDetailValidation from "../middleware/validations/nonRequestOrderDetailValidation";
import { ValidationError } from "class-validator";
import CannotCreateOrderDetailException from "../exceptions/orderDetail/CannotCreateOrderDetailException";
import IOrderResponse from "../structure/IOrderResponse";
import { OrderNote } from "../entities/OrderNotes";
import NoteNotFoundException from "../exceptions/orderNote/NoteNotFoundException";
import CannotFindOrderNotesWithOrderException from "../exceptions/orderNote/CannotFindOrderNotesWithOrderException";
import CannotCreateOrderNoteException from "../exceptions/orderNote/CannotCreateOrderNoteException";

class OrderNotesController {
    public path = "/order/:orderId/note";
    public router = Router();
    private orderNoteRepository = getRepository(OrderNote);

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(this.path, this.getOrderNotesByOrderId);
        this.router.get(`${this.path}/:id`, this.getOrderNoteById);
        this.router.post(this.path, this.createOrderNote);
    }

    private getOrderNoteById = (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        this.orderNoteRepository.findOne(id)
            .then((result: OrderNote) => {
                result ? response.send(result) : next(new NoteNotFoundException(id));
            })
            .catch((err) => {
                next(new HttpException(404, err));
            });
    };

    private getOrderNotesByOrderId = (request: Request, response: Response, next: NextFunction) => {
        const orderId = request.params.orderId;
        this.orderNoteRepository.createQueryBuilder("orderNotes")
            .where({
                orderID: orderId
            })
            .getMany()
            .then((result: OrderNote[]) => {
                result.length > 0 ? response.send(result) : next(new CannotFindOrderNotesWithOrderException(orderId));
            })
            .catch((err) => {
                next(new HttpException(404, err));
            });
    };

    private createOrderNote = (request: Request, response: Response, next: NextFunction) => {
        const orderNote: OrderNote = request.body;
        if (orderNote.orderID === undefined) {
            next(new CannotCreateOrderDetailException("Missing Order ID"));
        } else {
            nonRequestOrderDetailValidation(OrderNote, orderNote)
                .then((vErrors) => {
                    if (vErrors.length > 0) {
                        response.send(
                            next(
                                new CannotCreateOrderNoteException(
                                    vErrors.map((error: ValidationError) => Object.values(error.constraints)).join(", ")
                                )
                            )
                        );
                    } else {
                        const newOrderDetail = this.orderNoteRepository.create(orderNote);
                        this.orderNoteRepository.save(newOrderDetail)
                            .then((result: OrderNote) => {
                                response.send(result);
                            })
                            .catch((err) => {
                                next(new CannotCreateOrderNoteException(err));
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
    public createOrderNoteWithNewOrder = async (order: Order, orderNote: OrderNote, currentIOResponse: IOrderResponse): Promise<IOrderResponse> => {
        orderNote.orderID = order.orderID;
        const vErrors: ValidationError[] = await nonRequestOrderDetailValidation(OrderNote, orderNote);
        let vErrorString: string;
        if (vErrors.length > 0) {
            // created an order but details has constraint issues
            vErrorString = vErrors.map((error: ValidationError) => Object.values(error.constraints)).join(", ");
            if (currentIOResponse.error === undefined) {
                currentIOResponse.error = vErrorString;
            } else {
                currentIOResponse.error = currentIOResponse.error.concat(
                    [currentIOResponse.error, vErrorString].join(", ")
                );
            }
        } else {
            const newOrderNote = this.orderNoteRepository.create(orderNote);
            try {
                const noteResult: OrderNote = await this.orderNoteRepository.save(newOrderNote);
                currentIOResponse.orderNotes.push(noteResult);
            } catch (e) {
                // created an order but details has field value issues
                if (currentIOResponse.error === undefined) {
                    currentIOResponse.error = `Order Notes: ${e.message}`;
                } else {
                    currentIOResponse.error = currentIOResponse.error.concat(
                        [currentIOResponse.error, `Order Notes: ${e.message}`].join(", ")
                    );
                }
            }
        }
        return currentIOResponse;
    }
}

export default OrderNotesController;