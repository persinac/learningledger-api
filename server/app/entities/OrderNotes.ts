import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsNumber } from "class-validator";
import { Order } from "./Order";

@Entity("ordernotes")
export class OrderNote {
    @PrimaryGeneratedColumn()
    public orderNoteID?: number;

    @Column()
    @IsNumber()
    public orderID: number;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    public whyPurchaseID?: number;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    public whySellID?: number;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    public purchaseNotes?: string;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    public sellNotes?: string;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    public purchaseSentiment?: number;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    public sellSentiment?: number;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    public estimatedRisk?: number;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    public endGoal?: string;

    @ManyToOne(() => Order)
    @JoinColumn({
        name: "orderID",
        referencedColumnName: "orderID"
    })
    public order?: Order;
}