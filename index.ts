

const pathJoin = (a: string, b: string) => {
  return a + (a.endsWith('/') ? '' : '/') + b;
}

// from react-native
export type StatResult = {
  name: string | undefined // The name of the item TODO: why is this not documented?
  path: string // The absolute path to the item
  size: number // Size in bytes
  mode: number // UNIX file mode
  ctime: number // Created date
  mtime: number // Last modified date
  originalFilepath: string // In case of content uri this is the pointed file path, otherwise is the same as path
  isFile: () => boolean // Is the file just a file?
  isDirectory: () => boolean // Is the file a directory?
}

export type PuzzlePackageLoader = {
  stat: (path: string) => Promise<StatResult>;
  readFile: (path: string) => Promise<string>;
}

export type PuzzlePackageInfo = {
  name: string;
  icon?: string;
  version?: string;
  author?: string;
  displayName: string;
  description?: string;
  instructions?: string;
  comingSoon?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const bundle = await loader.stat(bundlePath);
    if (bundle.isFile()) {
      throw new Error('Bundle is not a directory');
    }
    const info = await loader.stat(pathJoin(bundlePath, 'puzzle.json'));
    if (info.isDirectory()) {
      throw new Error('Puzzle info is not a file');
    }
    const json = JSON.parse(await loader.readFile(info.path));
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
   * is loaded. When the puzzle is completed, this data will be
   * cleared.
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
      console.warn('Looks like you are not in a WebView');
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

export type PuzzleProps = {
  preview?: boolean;
  startFresh?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  onConfig?: (config?: any) => void;
  onProgress?: (progress?: any) => void;
  onFailure: (failure?: FailureOptions) => void;
  onSuccess: (success?: SuccessOptions) => void;
};