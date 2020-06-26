import IOrder from "./Order";
import IOrderDetail from "./OrderDetails";
import IOrderNotes from "./OrderNotes";


interface IOrderResponse {
    order?: IOrder;
    orderDetails?: IOrderDetail[];
    orderNotes?: IOrderNotes[];
    error?: string;
}

export default IOrderResponse;