"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var drunkmode_puzzles_exports = {};
__export(drunkmode_puzzles_exports, {
  PuzzleEnv: () => PuzzleEnv,
  PuzzleMessage: () => PuzzleMessage,
  PuzzlePackage: () => PuzzlePackage
});
module.exports = __toCommonJS(drunkmode_puzzles_exports);
var pathJoin = (a, b) => {
  return a + (a.endsWith("/") ? "" : "/") + b;
};
var PuzzlePackage = class {
  name;
  icon;
  version;
  author;
  displayName;
  description;
  instructions;
  html;
  baseUrl;
  loader;
  constructor({
    name,
    icon,
    version,
    author,
    displayName,
    description,
    instructions,
    html,
    baseUrl,
    loader
  }) {
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
  static async from(bundlePath, loader) {
    const bundle = await loader.stat(bundlePath);
    if (bundle.isFile()) {
      throw new Error("Bundle is not a directory");
    }
    const info = await loader.stat(pathJoin(bundlePath, "puzzle.json"));
    if (info.isDirectory()) {
      throw new Error("Puzzle info is not a file");
    }
    const json = JSON.parse(await loader.readFile(info.path));
    return new this({
      ...json,
      baseUrl: bundlePath,
      loader
    });
  }
  async loaded() {
    const uri = pathJoin(this.baseUrl, "index.html");
    const html = await this.loader.readFile(uri);
    this.html = html;
    return this;
  }
};
var PuzzleMessage = class _PuzzleMessage {
  event;
  data;
  get stringified() {
    return JSON.stringify({
      event: this.event,
      data: this.data
    });
  }
  constructor(event, data) {
    this.event = event;
    this.data = data;
  }
  static from(message) {
    const { event, data } = JSON.parse(message);
    return new _PuzzleMessage(event, data);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static onConfig(data) {
    new _PuzzleMessage("config", data).post();
  }
  /**
   * Call this method when the user has made progress on the puzzle.
   * This data is saved and will be injected into the puzzle when it
   * is loaded. When the puzzle is completed, this data will be
   * cleared.
   * 
   * @param data saved progress data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static onProgress(data) {
    new _PuzzleMessage("progress", data).post();
  }
  /**
   * Call this method when the user fails the puzzle.
   * 
   * @param options
   */
  static onFailure(options) {
    new _PuzzleMessage("failure", options).post();
  }
  /**
   * Call this method when the user successfully completes the puzzle.
   * 
   * @param options
   */
  static onSuccess(options) {
    new _PuzzleMessage("success", options).post();
  }
  post() {
    try {
      window.ReactNativeWebView.postMessage(this.stringified);
    } catch (e) {
      console.warn("Looks like you are not in a WebView");
      console.warn(e);
    }
  }
};
var PuzzleEnv = class {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store;
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
      this.store = { ...window.DrunkMode };
    } catch (e) {
      this.store = {
        preview: false,
        config: {},
        data: {}
      };
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PuzzleEnv,
  PuzzleMessage,
  PuzzlePackage
});
