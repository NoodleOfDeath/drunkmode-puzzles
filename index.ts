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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Data = Event extends 'success' ? SuccessOptions : Event extends 'failure' ? FailureOptions : any
> {

  public event: Event;
  public data?: Data;

  public get stringified() {
    return JSON.stringify({
      event: this.event,
      data: this.data
    });
  }

  public constructor(event: Event, data?: Data) {
    this.event = event;
    this.data = data;
  }

  public static from(message: string): PuzzleMessage<PuzzleEvent> {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export class PuzzleEnv {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any;

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
      this.store = { ...(window as any).DrunkMode };
    } catch (e) {
      this.store = {
        preview: false,
        config: {},
        data: {},
      }
    }
  }

}
