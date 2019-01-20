import { JSONObject } from './datatypes';
import { Connection, ChildConnection } from './base';


export type MultiplexerTarget = string|number|null;
interface MultiplexerMessage extends JSONObject {
    target: MultiplexerTarget;
    payload: JSONObject;
}


class MultiplexedConnection implements Connection {

    private name: MultiplexerTarget;
    private parent: ConnectionMultiplexer;
    receive = (d: JSONObject, b: DataView[]) => {};

    constructor(parent: ConnectionMultiplexer, name: MultiplexerTarget) {
        this.parent = parent;
        this.name = name;
    }

    send(data: JSONObject, binaries: DataView[]) : void {
        this.parent.send({
            target: this.name,
            payload: data
        }, binaries);
    }
}



export class ConnectionMultiplexer extends ChildConnection {

    private connectionTable : Map<string|number|null, MultiplexedConnection> = new Map();

    constructor(parent: Connection) {
        super(parent);
        this.receive = (d, p) => { this._receive_actual(<MultiplexerMessage>d, p) };
    }

    /**
     * Registers a new multiplexed connection.
     * 
     * This method will fail if a connection with this name already exists.
     * 
     * @param name The name of the multiplexed connection.
     * @returns    A connection object.
     */
    public register(name: MultiplexerTarget) : Connection {
        if (this.connectionTable.has(name))
            throw new Error("Target already exists");

        let conn = new MultiplexedConnection(this, name);
        this.connectionTable.set(name, conn);
        return conn;
    }

    /**
     * Unregisters a connection with the given name.
     * @param name The name of the multiplexed connection
     */
    public unregister(name: MultiplexerTarget) {
        if (this.connectionTable.has(name))
            this.connectionTable.delete(name);
    }

    private _receive_actual(data: MultiplexerMessage, binaries: DataView[]) : void {
        if (!this.connectionTable.has(data.target))
            return;

        
        let conn : MultiplexedConnection = <MultiplexedConnection>this.connectionTable.get(data.target);
        conn.receive(data.payload, binaries);
    }

}