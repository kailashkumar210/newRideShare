import User from "./User";

export default class Subscriber {
    user: User = new User();
    pendingSubscription : boolean = false;

    constructor (user:User, pendingSubscription: boolean){
        this.user = user;
        this.pendingSubscription = pendingSubscription;
    }
}