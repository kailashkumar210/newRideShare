export default class Organization {
    public id:number;
    public name: string;
    public code: string;
    public visible: boolean;

    constructor(){
        this.id=0;
        this.name='';
        this.code='';
        this.visible=false;
    }
}