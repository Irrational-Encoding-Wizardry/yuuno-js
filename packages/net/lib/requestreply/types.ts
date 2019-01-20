import {JSONValue, JSONObject} from '../datatypes';

export interface Envelope extends JSONObject {
    type: string,
    id: string,
    payload: JSONValue
}

export interface FailedResponse extends Envelope {
    type: "failure",
    id: string,
    payload: {message: string}
}

export interface AnswerResponse extends Envelope {
    type: "response",
    id: string,
    payload: JSONValue
}

export type ResponseEnvelope = FailedResponse|AnswerResponse;
export type Reply<T> = [T&JSONValue, DataView[]];
