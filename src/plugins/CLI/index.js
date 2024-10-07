import { Plugin } from '../plugin.js';
import { stdin, stdout } from 'process';
import { white, red, yellow } from '../../utils/consoleColors.js';
import { createInterface } from 'readline/promises';
import { HELP_SUGGESTION, INVALID_COMMAND_ERROR } from '../constants.js';

const cliDescriptor = {
  '--help': {
    event: 'help',
    args: null,
    help: null,
  },
};

export class CliPlugin extends Plugin {
  #readline = createInterface(stdin, stdout);

  constructor(...args) {
    super('cli', cliDescriptor, ...args);
    this.#initEvents();
  }

  get readlineInterface() {
    return this.#readline;
  }

  registerCommands = (targetKey, derivedCliDescriptor) => {
    Object.entries(derivedCliDescriptor).forEach(([command, commandDesc]) => {
      if (command === '--help') {
        this.cliDescriptor[command] = { ...commandDesc, targetKey };
        return;
      }
      if (this.cliDescriptor[command]) {
        throw new Error(
          `Command "${command}" already exists for ${this.cliDescriptor[command].targetKey} plugin`
        );
      }
      this.cliDescriptor[command] = { ...commandDesc, targetKey };
    });
  };

  #parseInput = (data) => {
    const parsed = data.toString().trim().split(' ');
    return {
      command: parsed[0],
      args: parsed.slice(1),
    };
  };

  #promptHandler = (question, callback) => {
    this.#readline.question(yellow(question) + '\n').then((answer) => callback(answer));
  };

  #inputHandler = (data) => {
    if (!data) {
      return;
    }
    const { command, args } = this.#parseInput(data);

    if (!this.cliDescriptor[command]) {
      this.emit('error', INVALID_COMMAND_ERROR, HELP_SUGGESTION);
      return;
    }

    const { targetKey, event } = this.cliDescriptor[command];
    this.fileManager._plugins[targetKey].emit(event, ...args);
  };

  #helpHandler = () => {
    const help = Object.values(this.cliDescriptor)
      .map(({ help }) => help)
      .filter(Boolean)
      .join('\n\n');
    stdout.write(help + '\n\n');
    this.emit('operationEnd');
  };

  #errorHandler = (message, ...desc) => {
    stdout.write(red`Error: ` + white(message) + '\n');
    for (const line of desc) {
      stdout.write(line + '\n');
    }
    this.emit('operationEnd');
  };

  #outHandler = (...data) => {
    for (let chunk of data) {
      if (typeof chunk === 'string') {
        stdout.write(yellow(chunk) + '\n');
      } else {
        const [value, format] = chunk;
        if (format === 'table') {
          console.table(value);
        } else {
          stdout.write(value + '\n');
        }
      }
    }
    this.emit('operationEnd');
  };

  #initEvents = () => {
    this.#readline.on('line', this.#inputHandler);

    this.on('out', this.#outHandler);
    this.on('error', this.#errorHandler);
    this.on('prompt', this.#promptHandler);
    this.on('help', this.#helpHandler);

    this.on('table', (...args) => {
      console.table(...args);
      this.emit('operationEnd');
    });
  };
}
