import OrderDetail from "./OrderDetails";

interface IOrder {
    orderID?: number;
    stockID: number;
    commodityType: number;
    contractType: number;
}

export default IOrder;