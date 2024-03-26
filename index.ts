export type MessageOptions = {
  message?: string;
  title?: string;
};

export type FailureOptions = MessageOptions & {
  messages?: string[];
};

export type SuccessOptions = MessageOptions;

export type PuzzleEvent = 'config' | 'failure' | 'progress' | 'success';

export class PuzzleMessage<
  Event extends PuzzleEvent,
  Data = Event extends 'success' ? SuccessOptions : FailureOptions
> {

  private fn: Event;
  private data?: Data;

  public get stringified() {
    return JSON.stringify({
      fn: this.fn,
      data: this.data
    });
  }

  public constructor(fn: Event, data?: Data) {
    this.fn = fn;
    this.data = data;
  }

  public static from(message: string): PuzzleMessage<PuzzleEvent> {
    const { fn, data } = JSON.parse(message);
    return new PuzzleMessage(fn, data);
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
  public static onConfig(data?: any) {
    (new PuzzleMessage('config', data)).post();
  }

  /**
   * Call this method when the user has made progress on the puzzle.
   * This data is saved and will be injected into the puzzle when it
   * is loaded.
   * 
   * @param data saved progress data
   */
  public static onProgress(data?: any) {
    (new PuzzleMessage('progress', data)).post();
  }

  /**
   * Call this method when the user fails the puzzle.
   * 
   * @param options
   */
  public static onFailure(options?: FailureOptions) {
    (new PuzzleMessage('failure', options)).post();
  }

  /**
   * Call this method when the user successfully completes the puzzle.
   * 
   * @param options
   */
  public static onSuccess(options?: SuccessOptions) {
    (new PuzzleMessage('success', options)).post();
  }

  public post() {
    try {
      (window as any).ReactNativeWebView.postMessage(this.stringified);
    } catch (e) {
      console.warn(e);
    }
  }

}
