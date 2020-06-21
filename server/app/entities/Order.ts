import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("order")
export class Order {
    @PrimaryGeneratedColumn()
    public orderID?: number;

    @Column()
    public stockID: number;

    @Column()
    public commodityType: number;

    @Column()
    public contractType: number;

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        default: null
    })
    public entryPrice: number;

    @Column({ default: null, nullable: true })
    public entryDatetime: Date;

    @Column({ default: null, nullable: true })
    public quantityBought: number;

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        default: null
    })
    public totalEntryPrice: number;

    @Column()
    public orderStatusID: number;

    @Column({ default: null, nullable: true })
    public exitDatetime: Date;

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        default: null
    })
    public exitPrice: number;

    @Column({ default: null, nullable: true })
    public quantitySold: number;

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        default: null
    })
    public totalExitPrice: number;
}