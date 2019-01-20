import { JSONObject } from './datatypes';


export interface Connection {
    /**
     * This function is called when the connection receives a new message.
     */
    receive: (data: JSONObject, binaries: DataView[]) => void;
    
    /**
     * This function should be overwritten to implement sending a message
     * over this connection.
     * 
     * @param data      The data to send. 
     * @param binaries  The binaries to send.
     */
    send(data: JSONObject, binaries: DataView[]) : void;
}


export abstract class ChildConnection implements Connection {
    protected parent: Connection;
    public receive = (d: JSONObject, binaries: DataView[]) => {};

    constructor(parent: Connection) {
        this.parent = parent;
        this.parent.receive = (data: JSONObject, binaries: DataView[]) => this._receive(data, binaries);
    }

    _receive(data: JSONObject, binaries: DataView[]) : void {
        this.receive(data, binaries);
    }

    send(data: JSONObject, binaries: DataView[]) : void {
        this.parent.send(data, binaries);
    }
}