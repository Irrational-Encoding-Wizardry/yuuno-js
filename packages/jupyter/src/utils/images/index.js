import Worker from "worker-loader?inline=true&name=worker.js&publicPath=/nbextensions/yuuno-ipython/!./impl.worker";
import { RequestReply } from '@yuuno/net';
import { MessageConnection } from '../Connection';
import MessagablePool from "../MessageablePool";


const pool = new MessagablePool({
    create: () => new Worker(),
    destroy: (worker) => worker.terminate(),

    maxlife: 30 * 1000,
    create_life: 5 * 1000,
    maxsize: 5,
});
const reqrepl = new RequestReply(new MessageConnection(pool, false));


export default class ImageOperations {
    async resizeImage(pngBuffer, w, h) {
        const reply = await reqrepl.request('resize', {w, h}, [pngBuffer.buffer]);
        return reply[1];
    }
}