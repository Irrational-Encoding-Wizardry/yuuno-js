type RawFormatV1 = [number, number, number, number, number, number, boolean, boolean, "v1"];
export type WireFormat = RawFormatV1;

export interface RawFormat {
    bits_per_sample: number;
    num_fields: number;
    family: "grey"|"rgb"|"yuv";
    sample_type: "float"|"integer";
    subsampling_h: number;
    subsampling_w: number;
    packed: boolean;
    planar: boolean;
}


export function convertFromWire(src: WireFormat) : RawFormat {
    if (src instanceof Array && src.length === 9 && src[8] === "v1") {
        let rf = <RawFormat>{};
        rf.bits_per_sample = src[0];
        rf.num_fields = src[1];
        rf.family = src[2]===0?"grey":(src[2]===1?"rgb":"yuv");
        rf.sample_type = src[3]===0?"integer":"float";
        rf.subsampling_h = src[4];
        rf.subsampling_w = src[5];
        rf.packed = src[6];
        rf.planar = src[7];
        return rf;
    } else {
        throw new Error("Unknown Wire-Format.");
    }
}

export function convertToWire(src: RawFormat) : RawFormatV1 {
    return [
        src.bits_per_sample,
        src.num_fields,
        {"grey":0,"rgb":1,"yuv":2}[src.family],
        {"integer":0,"float":1}[src.sample_type],
        src.subsampling_h,
        src.subsampling_w,
        src.packed,
        src.planar,
        "v1"
    ];
}