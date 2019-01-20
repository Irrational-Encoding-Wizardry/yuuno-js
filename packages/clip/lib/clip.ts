import { RequestReply } from '@yuuno/net';
import { JSONValue } from '@yuuno/net/dist/datatypes';

import {WireFormat, RawFormat, convertFromWire, convertToWire} from './format';

export type Metadata = {[key: string]: JSONValue };


export class Clip extends RequestReply {

    async getLength() : Promise<number> {
        return (await this.request<number>("length"))[0];
    }

    async getFormat(frame: number) : Promise<RawFormat> {
        const wire = (await this.request<WireFormat>("format", {frame}))[0];
        return convertFromWire(wire);
    }

    async getClipMetadata() : Promise<Metadata> {
        const data = await this.request<Metadata>("metadata", {frame: null});
        return data[0];
    }

    async getSize(frame: number) : Promise<[number, number]> {
        return (await this.request<[number, number]>("size", {frame}))[0];
    }

    async getMetadata(frame: number) : Promise<Metadata> {
        const data = await this.request<Metadata>("metadata", {frame});
        return data[0];
    }

    async canRender(frame: number, format: RawFormat) : Promise<boolean> {
        const result = await this.request<{size: [number,number]|null}>(
            "render",
            {
                frame,
                format: convertToWire(format),
                plane: null
            }
        );
        return result[0].size !== null;
    }

    async png(frame: number) : Promise<DataView> {
        const result = await this.request<{size: [number, number]}>("frame", {frame});
        return result[1][0];
    }

    async render(frame: number, plane: number|number[], format?: RawFormat) : Promise<DataView[]> {
        if (!(plane instanceof Array))
            plane = [plane];
        if (format === undefined)
            format = await this.getFormat(frame);

        const result = await this.request("render", {frame, plane, format: convertToWire(format)});
        return result[1];
    }

}