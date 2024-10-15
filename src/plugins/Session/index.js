import { argv } from 'process';
import { Plugin } from '../plugin.js';
import { blue, yellow } from '../../utils/consoleColors.js';

const cliDescriptor = {
  '.exit': {
    event: 'exit',
    args: null,
    help: blue`.exit` + ' - close file manager',
  },
};

export class SessionPlugin extends Plugin {
  #userName;

  constructor(...args) {
    super('session', cliDescriptor, ...args);
    this.#initUser();
    this.#handleExit();
    this.fileManager._plugins.cli.readlineInterface.on('SIGINT', () => this.emit('exit'));
  }

  get userName() {
    return this.#userName;
  }

  #greet = () => {
    const { cli } = this.fileManager._plugins;
    cli.emit('out', [`Welcome to the File Manager, ${yellow(this.userName)}!`]);
  };

  #initUser = () => {
    const cliPassedName = argv.find((it) => it.startsWith('--username'));
    if (!cliPassedName) {
      const { cli } = this.fileManager._plugins;
      cli.emit('prompt', 'Please enter your name:', (answer) => {
        this.#userName = answer;
        this.#greet();
      });
      return;
    }
    this.#userName = cliPassedName.split('=')[1];
    this.#greet();
  };

  #handleExit = () => {
    this.on('exit', () => {
      process.stdout.write(
        `\nThank you for using File Manager, ${yellow(this.userName ?? 'Anonymous')}, goodbye!\n`
      );
      process.exit(0);
    });
  };
}
