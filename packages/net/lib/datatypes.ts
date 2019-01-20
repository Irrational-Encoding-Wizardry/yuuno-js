export interface JSONArray extends Array<JSONValue> {};
export interface JSONObject {
    [identifier: string]: JSONValue;
}
export type JSONValue = string|number|boolean|null|JSONArray|JSONObject