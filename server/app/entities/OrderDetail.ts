import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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
        precision: 6,
        scale: 2,
        default: null
    })
    @IsNumber()
    public price: number;

    @Column({ default: null, nullable: true })
    public orderDatetime: Date;

    @Column({ default: null, nullable: true })
    @IsNumber()
    public quantityBought: number;

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        default: null
    })
    @IsNumber()
    public totalPrice: number;

    @Column()
    @IsNumber()
    public orderStatusID: number;

    @ManyToOne(() => Order, (o: Order) => o.orderDetails)
    public orderHeader: Order;
}