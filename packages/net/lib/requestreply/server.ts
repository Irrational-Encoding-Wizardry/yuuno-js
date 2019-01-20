import { Connection, ChildConnection } from '../base';
import { JSONValue } from '../datatypes';

import { Reply, Envelope, FailedResponse, AnswerResponse } from './types';


export type Procedure<T> = (data: JSONValue, binaries: DataView[]) => Promise<Reply<T&JSONValue>>


function dontForget(c: Promise<any>) {
    c.catch(console.error);
}


export class RequestReplyServer extends ChildConnection {
    private commandMap: Map<string, Procedure<any>> = new Map();

    constructor(parent: Connection) {
        super(parent);
        this.receive = (data: JSONValue, binaries: DataView[]) => {
            dontForget(this._actual_receive(<Envelope>data, binaries));
        };
    }

    private async _actual_receive(data: Envelope, binaries: DataView[]) : Promise<void> {
        if (!!data.id) return;

        try {
            if (!this.commandMap.has(data.type)) {
                throw new Error("Couldn't find method.");
            }

            const func: Procedure<any> = <Procedure<any>>this.commandMap.get(data.type);
            const reply = await func(data.payload, binaries);

            this.send(<AnswerResponse>{
                id: data.id,
                type: "response",
                payload: reply[0]
            }, reply[1]);
        } catch (e) {
            this.send(<FailedResponse>{
                id: data.id,
                payload: {
                    message: e.toString()
                },
                type: "failure"
            }, []);
        }
    }
}