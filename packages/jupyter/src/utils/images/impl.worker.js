import JIMP from 'jimp/es';
import { MessageConnection } from '../Connection';
import { RequestReplyServer } from '@yuuno/net';


const server = new RequestReplyServer(new MessageConnection(self, true));
server.register("resize", async ({w, h}, [buffer]) => {
    let img = await JIMP.read(buffer);
    const buf = (await img.resize(w, h, JIMP.RESIZE_NEAREST_NEIGHBOR).getBufferAsync(JIMP.MIME_PNG)).buffer;
    return {}, [buf];
})