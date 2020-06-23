import { OrderDetail } from "../../entities/OrderDetail";
import { Order } from "../../entities/Order";

/***
 * Not pleased with the get / set methods here..
 * but unsure how to make these 'act' like a class in the Entity definition(s)
 */
export class OrderDetailUtility {
    public static setNewOrderDetailValues(order: Order, orderDetail: OrderDetail): OrderDetail {
        orderDetail.orderID = orderDetail.orderID || order.orderID;
        orderDetail.totalPrice = orderDetail.totalPrice || 0.00;
        orderDetail.orderDatetime = orderDetail.orderDatetime || new Date();

        return orderDetail;
    }

    public static getOrderDetailTotalPrice(orderDetail: OrderDetail): number {
        return orderDetail.quantityBought * orderDetail.price;
    }
}
