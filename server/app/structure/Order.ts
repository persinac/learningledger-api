import OrderDetail from "./OrderDetails";

interface Order {
    orderID: number;
    stockID: number;
    commodityType: number;
    contractType: number;
    orderDetails: OrderDetail;
}

export default Order;