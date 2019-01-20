export class WidgetConnection {
    constructor(widget) {
        this.receive = (d, b) => {};
        this.widget = widget;
        this.widget.model.on('msg:custom', (...args) => this.receive(...args), this);
    }


    send(data, binaries) {
        this.widget.send(data, binaries);
    }
}


export class MessageConnection {
    /**
     * @param detachBuffer  Tell the postMessage function to detach the buffers to be sent.
     */
    constructor(message, detachBuffer=true) {
        this.detachBuffer = detachBuffer;
        this.receive = (d, b) => {};
        this.message = message;
        this.message.onmessage = (event) => this.receive(event.data.data, event.data.binaries);
    }

    send(data, binaries) {
        this.message.postMessage({data, binaries}, this.detachBuffer?binaries:[]);
    }
}