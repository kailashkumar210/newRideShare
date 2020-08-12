import Organization from "./Organization";

export default class User {
    public id:number;
    public username:string;
    public password:string;
    public email:string;
    public name: string;
    public authtype: number;
    public verified: number;
    public isDriver: number;
    public token: string;
    public phone: string;
    public photo: string;
    public organization: Organization;
    public tokenExpireTime: number;
    public role: string;

    constructor(){
        this.id=0;
        this.username='';
        this.password='';
        this.email='';
        this.name='';
        this.authtype=0;
        this.verified=0;
        this.isDriver=0;
        this.token='';
        this.phone='';
        this.photo='';
        this.organization=new Organization();
        this.tokenExpireTime = 0;
        this.role='';
    }
}