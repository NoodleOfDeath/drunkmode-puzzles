type MessageOptions = {
  message?: string;
  title?: string;
};

export type FailureOptions = MessageOptions & {
  messages?: string[];
};

export type SuccessOptions = MessageOptions;

export type PuzzleEvent = 'failure' | 'success';

export declare class PuzzleMessage<
  Event extends PuzzleEvent,
  Data = Event extends 'success' ? SuccessOptions : FailureOptions
> {

  fn: Event;
  data?: Data;

  get stringified(): string;

  constructor(fn: Event, data?: Data);

  static from(message: string): void;

  static onFailure(options?: FailureOptions): void;

  static onSuccess(options?: SuccessOptions): void;

  post(): void;

}
