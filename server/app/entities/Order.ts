import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IsNumber, ValidateIf } from "class-validator";
import { OrderDetail } from "./OrderDetail";

@Entity("order")
export class Order {
    @PrimaryGeneratedColumn()
    public orderID?: number;

    @Column()
    @IsNumber()
    public stockID: number;

    @Column()
    @IsNumber()
    public commodityType: number;

    @Column()
    @IsNumber()
    public contractType: number;

    @OneToMany(() => OrderDetail, (od: OrderDetail) => od.orderHeader)
    public orderDetails: OrderDetail[];
}