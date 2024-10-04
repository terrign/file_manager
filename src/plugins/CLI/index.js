import { Plugin } from '../plugin.js';
import { stdin, stdout } from 'process';
import { white, red, blue, yellow, green } from '../../utils/consoleColors.js';
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
    this.#initListeners();
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
    const { command, args } = this.#parseInput(data);

    if (!this.cliDescriptor[command]) {
      this.#errorHandler(INVALID_COMMAND_ERROR, HELP_SUGGESTION);
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
    stdout.write(help + '\n');
  };

  #errorHandler = (message, ...desc) => {
    stdout.write(red`Error: ` + white(message) + '\n');
    for (const line of desc) {
      stdout.write(line + '\n');
    }
  };

  #initListeners = () => {
    this.on('out', (string) => {
      stdout.write(yellow(string) + '\n');
    });
    this.on('error', this.#errorHandler);
    this.on('prompt', this.#promptHandler);
    this.#readline.on('line', (data) => {
      if (!data) {
        return;
      }
      this.#inputHandler(data);
    });
    this.#readline.on('SIGINT', () => this.fileManager._plugins.session.emit('exit'));
    this.on('help', this.#helpHandler);
    this.on('table', console.table);
  };
}
