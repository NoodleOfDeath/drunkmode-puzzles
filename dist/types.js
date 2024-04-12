"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuzzleEnv = exports.PuzzleMessage = exports.PuzzlePackage = void 0;
const pathJoin = (a, b) => {
    return a + (a.endsWith('/') ? '' : '/') + b;
};
class PuzzlePackage {
    constructor({ name, icon, version, author, displayName, description, instructions, html, baseUrl, loader, }) {
        this.name = name;
        this.icon = icon;
        this.version = version;
        this.author = author;
        this.displayName = displayName;
        this.description = description;
        this.instructions = instructions;
        this.html = html;
        this.baseUrl = baseUrl;
        this.loader = loader;
    }
    static from(bundlePath, loader) {
        return __awaiter(this, void 0, void 0, function* () {
            const infoPath = pathJoin(bundlePath, 'puzzle.json');
            const info = yield loader.exists(infoPath);
            if (!info) {
                throw new Error('Bundle is malformed');
            }
            const json = JSON.parse(yield loader.readFile(infoPath));
            return new this(Object.assign(Object.assign({}, json), { baseUrl: bundlePath, loader }));
        });
    }
    loaded() {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = pathJoin(this.baseUrl, 'index.html');
            const html = yield this.loader.readFile(uri);
            this.html = html;
            return this;
        });
    }
}
exports.PuzzlePackage = PuzzlePackage;
class PuzzleMessage {
    get stringified() {
        return JSON.stringify({
            data: this.data,
            event: this.event,
        });
    }
    constructor(event, data) {
        this.event = event;
        this.data = data;
    }
    static from(message) {
        const { event, data } = JSON.parse(message);
        return new PuzzleMessage(event, data);
    }
    /**
     * Call this method when the user has changed a starting
     * configuration of your puzzle, such as selecting a
     * difficulty level or changing the size of the puzzle.
     * This config value is used when previewing the puzzle, and
     * saved when the user selects the puzzle and will be injected
     * into the puzzle when it is loaded.
     *
     * @param data the configuration data
     */
    static onConfig(data) {
        (new PuzzleMessage('config', data)).post();
    }
    /**
     * Call this method when the user has made progress on the puzzle.
     * This data is saved and will be injected into the puzzle when it
     * is loaded. When the puzzle is completed, this data will be
     * cleared.
     *
     * @param data saved progress data
     */
    static onProgress(data) {
        (new PuzzleMessage('progress', data)).post();
    }
    /**
     * Call this method when the user fails the puzzle.
     *
     * @param options
     */
    static onFailure(options) {
        (new PuzzleMessage('failure', options)).post();
    }
    /**
     * Call this method when the user successfully completes the puzzle.
     *
     * @param options
     */
    static onSuccess(options) {
        (new PuzzleMessage('success', options)).post();
    }
    post() {
        try {
            window.ReactNativeWebView.postMessage(this.stringified);
        }
        catch (e) {
            console.warn('Looks like you are not in a WebView');
            console.warn(e);
        }
    }
}
exports.PuzzleMessage = PuzzleMessage;
class PuzzleEnv {
    get preview() {
        return this.store.preview;
    }
    get config() {
        return this.store.config;
    }
    get data() {
        return this.store.data;
    }
    constructor() {
        try {
            this.store = Object.assign({}, window.DrunkMode);
        }
        catch (e) {
            this.store = {
                config: {},
                data: {},
                preview: false,
            };
        }
    }
}
exports.PuzzleEnv = PuzzleEnv;
