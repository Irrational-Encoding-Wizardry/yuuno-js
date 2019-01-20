export class Counter<T> {
    private state: number = 0;
    private converter: (newstate: number) => T;

    constructor(converter: (newstate: number) => T) {
        this.converter = converter;
    }

    increment() : T {
        let newstate = this.state++;
        return this.converter(newstate);
    }

    static makeNumberCounter() : Counter<number> {
        return new Counter<number>((n) => n);
    }
}

export class PromiseDelegate<T> {

    private cb: (func: (rs: (v: T)=>void, rj: (r: any)=>void) => void) => void;
    private _promise: Promise<T>;

    constructor() {
        let _ops: ((rs: (v: T)=>void, rj: (r: any)=>void) => void)[] = [];
        this.cb = (func) => _ops.push(func);
        this._promise = new Promise((rs, rj) => {
            // Replace the callback.
            this.cb = (func) => {func(rs, rj)};

            // Call the queued operations.
            for (let op of _ops) {
                op(rs, rj);
            }
            // Empty the array to free the references.
            _ops.length = 0;
        });
    }

    resolve(v: T) : void {
        this.cb((rs) => rs(v));
    }

    reject(r: any) : void {
        this.cb((_, rj) => rj(r));
    }

    get promise() : Promise<T> {
        return this._promise;
    }

}