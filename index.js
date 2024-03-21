export class PuzzleMessage {

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
    if (fn === 'success') {
      return new PuzzleMessage(fn, data);
    } else if (fn === 'failure') {
      return new PuzzleMessage(fn, data);
    }
    throw new Error('Unexpected event type');
  }

  static onFailure(options) {
    (new PuzzleMessage('failure', options)).post();
  }

  static onSuccess(options) {
    (new PuzzleMessage('success', options)).post();
  }

  post() {
    window.ReactNativeWebView.postMessage(this.stringified);
  }

}
