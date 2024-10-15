import { EventEmitter } from 'events';

export class Plugin extends EventEmitter {
  #key;
  #fileManager;
  #cliDescriptor;

  constructor(key, cliDescriptor, fileManager, emitterOptions) {
    super(emitterOptions);
    this.#key = key;
    this.#fileManager = fileManager;
    this.#cliDescriptor = cliDescriptor;
  }

  get key() {
    return this.#key;
  }

  get fileManager() {
    return this.#fileManager;
  }

  get cliDescriptor() {
    return this.#cliDescriptor;
  }

  get help() {
    return Object.values(this.#cliDescriptor)
      .map(({ help }) => help)
      .join('\n');
  }
}
