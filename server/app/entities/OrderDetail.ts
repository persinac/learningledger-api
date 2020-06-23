import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsNumber, ValidateIf } from "class-validator";
import { Order } from "./Order";

@Entity("orderdetails")
export class OrderDetail {
    @PrimaryGeneratedColumn()
    public orderDetailID?: number;

    @Column()
    @IsNumber()
    public orderID: number;


    @Column()
    @IsNumber()
    public orderTypeID: number;

    @Column({
        type: "decimal",
        precision: 11,
        scale: 2,
        // tslint:disable-next-line:no-null-keyword
        default: null
    })
    @IsNumber()
    public price: number;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    public orderDatetime: Date;

    // tslint:disable-next-line:no-null-keyword
    @Column({ default: null, nullable: true })
    @IsNumber()
    public quantityBought: number;

    @Column({
        type: "decimal",
        precision: 11,
        scale: 2,
        // tslint:disable-next-line:no-null-keyword
        default: null
    })
    @IsNumber()
    public totalPrice: number;

    @Column()
    @IsNumber()
    public orderStatusID: number;

    @ManyToOne(() => Order)
    @JoinColumn({
        name: "orderID",
        referencedColumnName: "orderID"
    })
    public order?: Order;
}