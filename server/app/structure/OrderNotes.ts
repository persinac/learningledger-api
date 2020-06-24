interface IOrderNotes {
    orderNoteID?: number;
    orderID: number;
    whyPurchaseID?: number;
    whySellID?: number;
    purchaseNotes?: string;
    sellNotes?: string;
    purchaseSentiment?: number;
    sellSentiment?: number;
    estimatedRisk?: number;
    endGoal?: string;
}

export default IOrderNotes;