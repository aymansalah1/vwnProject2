class Observable {

    constructor() {
        this.subscribers = [];
        this.actions = [
            'markSelectedBarItem',
            'tagSelection',
            'iAmCompany',
            'orgSelection'
        ];
    }

    subscribe(f) {
        this.subscribers.push(f);
    }

    unsubscribe(f) {
        this.subscribers = this.subscribers.filter(subscriber => subscriber !== f);
    }

    notify(action, value) {
        if (this.actions.indexOf(action) > -1) {
            if (value === undefined) {
                this.subscribers.forEach(subscriber => {subscriber(action);});
            }
            else {
                this.subscribers.forEach(subscriber => {subscriber(action, value);});
            }
        }
        else {
            throw(Error);
        }
    }

}

export default new Observable();