interface OrderDetail {
    orderDetailID: number;
    orderID: number;
    orderTypeID: number;
    price: number;
    orderDatetime: Date;
    quantityBought: number;
    totalPrice: number;
    orderStatusID: number;
}

export default OrderDetail;