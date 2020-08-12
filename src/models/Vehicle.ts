
export default class Vehicle {
    public id:number;
    public model:string;
    public type:string;
    public plate:string;
    public capacity: number;
    public color: string;
    public fuel: string;

    constructor() {
        this.id=0;
        this.model='';
        this.type='car';
        this.plate='';
        this.capacity=1;
        this.color='white';
        this.fuel='';
    }
}