import Disposer from '../../utils/Disposer';
import FrameCache from '../../utils/FrameCache';
import VuexBackboneBridge from '../../utils/VuexBackboneValueBridge';

import { Clip } from '@yuuno/clip';
import { ConnectionMultiplexer } from '@yuuno/net';
import { WidgetConnection } from '../../utils/Connection';


const cache = new FrameCache({max: 10});


export default class PreviewModel extends Disposer {
    constructor(widget) {
        super();
        this.widget = widget;
        this._connection = new ConnectionMultiplexer(new WidgetConnection(widget));

        this.clip = new Clip(this._connection.register('clip'));
        this.diff = new Clip(this._connection.register('diff'));
    }

    bind(store, {namespace}) {
        const disp = VuexBackboneBridge(this.widget.model, {vuex: store, moduleName: namespace}, ['clip', 'diff', 'frame', 'zoom'], () => this.widget.touch());
        this.addDisposer(() => disp.dispose());
    }

    async _rawRequest(target, endpoint, content, buffers) {
        return (await this[target].request(endpoint, content, buffers));
    }

    async requestFrame(type) {
        // Make sure we don't have a race condition and always send the requested frame.
        return await cache.get(`frame-${this.widget.model.get(type)}-${this.widget.model.get('frame')}`, async()=>{
            return await this._rawRequest(type, "frame", {frame: this.widget.model.get('frame')}, []);
        });
    }

    async requestMeta(type) {
        return await this._rawRequest(type, 'metadata', {frame: this.widget.model.get('frame')}, []);

    }

    async requestClipMeta(type) {
        return await this._rawRequest(type, 'metadata', {frame: null}, []);
    }

    async requestFormat(type) {
        return await this._rawRequest(type, 'format', {frame: this.widget.model.get('frame')}, []);
    }

    async requestLength(type) {
        const [payload, buffers] = await this._rawRequest(type, 'length', {}, [])
        payload.clip_id = this.widget.model.get(type);
        return [payload, buffers];
    }

    _target() {
    }
    
}