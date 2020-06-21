interface Order {
    stockId: number;
    contract: number;
    contractType: number;
    entryPrice: number;
    quantityBought: number;
    totalEntryPrice: number;
}

export default Order;