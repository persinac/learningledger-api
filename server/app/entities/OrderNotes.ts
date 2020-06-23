import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsNumber, ValidateIf } from "class-validator";
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
    @IsNumber()
    public whyPurchaseID: number;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    @IsNumber()
    public whySellID: number;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    public purchaseNotes: string;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    public sellNotes: string;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    @IsNumber()
    public purchaseSentiment: number;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    @IsNumber()
    public sellSentiment: number;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    @IsNumber()
    public estimatedRisk: number;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    public endGoal: string;

    @ManyToOne(() => Order)
    @JoinColumn({
        name: "orderID",
        referencedColumnName: "orderID"
    })
    public order?: Order;
}