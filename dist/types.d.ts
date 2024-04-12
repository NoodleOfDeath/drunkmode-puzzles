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
export declare class PuzzlePackage implements PuzzlePackageProps {
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
    constructor({ name, icon, version, author, displayName, description, instructions, html, baseUrl, loader, }: PuzzlePackageProps);
    static from(bundlePath: string, loader: PuzzlePackageLoader): Promise<PuzzlePackage>;
    loaded(): Promise<this>;
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
export declare class PuzzleMessage<Event extends PuzzleEvent, Data = Event extends 'success' ? SuccessOptions : Event extends 'failure' ? FailureOptions : any> {
    event: Event;
    data?: Data;
    get stringified(): string;
    constructor(event: Event, data?: Data);
    static from(message: string): PuzzleMessage<PuzzleEvent>;
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
    static onConfig(data?: any): void;
    /**
     * Call this method when the user has made progress on the puzzle.
     * This data is saved and will be injected into the puzzle when it
     * is loaded. When the puzzle is completed, this data will be
     * cleared.
     *
     * @param data saved progress data
     */
    static onProgress(data?: any): void;
    /**
     * Call this method when the user fails the puzzle.
     *
     * @param options
     */
    static onFailure(options?: FailureOptions): void;
    /**
     * Call this method when the user successfully completes the puzzle.
     *
     * @param options
     */
    static onSuccess(options?: SuccessOptions): void;
    post(): void;
}
export declare class PuzzleEnv {
    store: any;
    get preview(): any;
    get config(): any;
    get data(): any;
    constructor();
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
