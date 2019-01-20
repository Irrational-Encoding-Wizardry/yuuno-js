import { ChildConnection, Connection } from "../base";
import { JSONObject } from "../datatypes";
import { Counter, PromiseDelegate } from "../utils";

import { Reply, ResponseEnvelope, Envelope } from './types';


const connection_counter = Counter.makeNumberCounter();

export class RequestReply extends ChildConnection {

    request_counter: Counter<string>;
    request_map : Map<string, PromiseDelegate<Reply<any>>> = new Map();

    constructor(parent: Connection) {
        super(parent);
        this.receive = (d, b) => { this._actual_receive(<ResponseEnvelope>d, b)}
        let connection_id = connection_counter.increment();
        this.request_counter = new Counter((s) => `${connection_id}/${s}`);
    }

    public request<T>(name: string, data?: JSONObject, binaries?: DataView[]) : Promise<Reply<T>> {
        if (binaries === undefined)
            binaries = [];

        if (data === undefined)
            data = {};

        let id = this.request_counter.increment();

        let envelope: Envelope = {
            type: name,
            id: id,
            payload: data
        }
        let pd = new PromiseDelegate<Reply<T>>();
        this.request_map.set(id, pd);
        this.send(envelope, binaries);
        return pd.promise;
    }

    private _actual_receive(data: ResponseEnvelope, binaries: DataView[]) : void {
        if (!this.request_map.has(data.id))
            return;

        let pd = <PromiseDelegate<Reply<any>>>this.request_map.get(data.id);
        if (data.type === "failure")
            pd.reject(new Error(data.payload.message));
        else
            pd.resolve([data.payload, binaries]);
    }
}