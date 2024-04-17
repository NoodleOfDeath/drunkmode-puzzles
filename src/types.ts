/* eslint-disable @typescript-eslint/no-explicit-any */

const pathJoin = (a: string, b: string) => {
  return a + (a.endsWith('/') ? '' : '/') + b;
};

export type PuzzlePackageLoader = {
  exists: (path: string) => Promise<boolean>;
  readFile: (path: string) => Promise<string>;
};

export type PuzzlePackageInfo = {
  name: string;
  icon?: string;
  version?: string;
  author?: string;
  displayName: string;
  description?: string;
  instructions?: string;
  comingSoon?: boolean;
  config?: any;
  data?: any;
};

export type PuzzlePackageProps = PuzzlePackageInfo & {
  html?: string;
  baseUrl: string;
  loader: PuzzlePackageLoader;
};

export class PuzzlePackage implements PuzzlePackageProps {

  name: string;
  icon?: string;
  version?: string;
  author?: string;
  displayName: string;
  description?: string;
  instructions?: string;
  html?: string;
  baseUrl: string;

  loader: PuzzlePackageLoader;

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
    loader,
  }: PuzzlePackageProps) {
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

  static async from(bundlePath: string, loader: PuzzlePackageLoader) {
    const infoPath = pathJoin(bundlePath, 'puzzle.json');
    const info = await loader.exists(infoPath);
    if (!info) {
      throw new Error('Bundle is malformed');
    }
    const json = JSON.parse(await loader.readFile(infoPath));
    return new this({
      ...json,
      baseUrl: bundlePath,
      loader,
    });
  }

  async loaded() {
    const uri = pathJoin(this.baseUrl, 'index.html');
    const html = await this.loader.readFile(uri);
    this.html = html;
    return this;
  }

}

export type MessageOptions = {
  message?: string;
  title?: string;
};

export type FailureOptions = MessageOptions & {
  messages?: string[];
};

export type SuccessOptions = MessageOptions;

export type PuzzleEvent = 'config' | 'failure' | 'progress' | 'success';

export const DevReactNativeWebView = {
  postMessage: (msg: string) => {
    const { event, data } = PuzzleMessage.from(msg);
    switch (event) {
      case 'config':
        (window as any).DrunkMode = {
          ...(window as any).DrunkMode,
          config: data,
        };
        break;
      case 'progress':
        (window as any).DrunkMode = {
          ...(window as any).DrunkMode,
          progress: data,
        };
        break;
      case 'failure':
        (window as any).alert('Epic fail! Try again');
        break;
      case 'success':
        (window as any).alert('Nice job! You completed the puzzle!');
        break;
      default:
        break;
    }
  }
}

export type IDrunkMode = {
  config: any;
  data: any;
  preview: boolean;
}

export const DevDrunkMode: IDrunkMode = {
  config: {},
  data: {},
  preview: false,
}

export class PuzzleMessage<
  Event extends PuzzleEvent,
  Data = Event extends 'success' ? SuccessOptions : Event extends 'failure' ? FailureOptions : any
> {

  public event: Event;
  public data?: Data;

  public get stringified() {
    return JSON.stringify({
      data: this.data,
      event: this.event,
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
  public static onConfig(data?: any) {
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
      (window as any).ReactNativeWebView = DevReactNativeWebView;
      this.post();
    }
  }

}

export class PuzzleEnv {

  store: IDrunkMode;

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
      this.store = { ...(window as any).DrunkMode } as IDrunkMode;
    } catch (e) {
      this.store = DevDrunkMode;
    }
  }

}

export type PuzzleProps = {
  preview?: boolean;
  startFresh?: boolean;
  config?: any;
  data?: any;
  onConfig?: (config?: any) => void;
  onProgress?: (progress?: any) => void;
  onFailure: (failure?: FailureOptions) => void;
  onSuccess: (success?: SuccessOptions) => void;
};