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
  PuzzleMessage: () => PuzzleMessage
});
module.exports = __toCommonJS(drunkmode_puzzles_exports);
var PuzzleMessage = class _PuzzleMessage {
  fn;
  data;
  get stringified() {
    return JSON.stringify({
      fn: this.fn,
      data: this.data
    });
  }
  constructor(fn, data) {
    this.fn = fn;
    this.data = data;
  }
  static from(message) {
    const { fn, data } = JSON.parse(message);
    return new _PuzzleMessage(fn, data);
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
    new _PuzzleMessage("config", data).post();
  }
  /**
   * Call this method when the user has made progress on the puzzle.
   * This data is saved and will be injected into the puzzle when it
   * is loaded.
   * 
   * @param data saved progress data
   */
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
      console.warn(e);
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PuzzleMessage
});
