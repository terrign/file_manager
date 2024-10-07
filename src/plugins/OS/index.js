import { blue, green, yellow } from '../../utils/consoleColors.js';
import { HELP_SUGGESTION, INVALID_COMMAND_ERROR } from '../constants.js';
import { Plugin } from '../plugin.js';
import os from 'os';

const help = `${blue('os')} ${green('[--arg]')}
${green('--EOL')} - get EOL (default system End-Of-Line)
${green('--cpus')} - get host machine CPUs info
${green('--homedir')} - get home directory
${green('--username')} - get current system user name
${green('--architecture')} - get CPU architecture for which Node.js binary has compiled`;

const cliDescriptor = {
  os: {
    event: 'os',
    args: { 0: ['--EOL', '--cpus', '--homedir', '--username', '--architecture'] },
    help,
  },
};

export class OsPlugin extends Plugin {
  constructor(...args) {
    super('os', cliDescriptor, ...args);
    this.#initListeners();
  }

  get cpus() {
    const cpusData = os.cpus().map(({ model, speed }) => ({
      model,
      speed: `${(speed / 1000).toFixed(2)}GHz`,
    }));
    const cpusCount = cpusData.length;

    return { cpusCount, cpusData };
  }

  get EOL() {
    return JSON.stringify(os.EOL);
  }

  get homedir() {
    return os.homedir();
  }

  get username() {
    return os.userInfo().username;
  }

  get architecture() {
    return os.arch();
  }

  #validateArgs = (incArgs) => {
    const { cli } = this.fileManager._plugins;
    if (incArgs.length === 0) {
      cli.emit('error', INVALID_COMMAND_ERROR, HELP_SUGGESTION);
      return false;
    }

    for (let i = 0; i < incArgs.length; i++) {
      const nthArgAcceptableValues = this.cliDescriptor.os.args[i];
      const arg = incArgs[i];
      if (!nthArgAcceptableValues.includes(arg)) {
        cli.emit('error', `Invalid argument [${arg}] passed`, HELP_SUGGESTION);
        return false;
      }
    }

    return true;
  };

  #initListeners = () => {
    const { cli } = this.fileManager._plugins;

    this.on('os', (...args) => {
      if (!this.#validateArgs(args)) {
        return;
      }
      const arg = args[0].slice(2);
      if (arg === 'cpus') {
        const { cpusData, cpusCount } = this.cpus;
        cli.emit('out', [`Total CPU's count: ` + yellow(cpusCount)], [cpusData, 'table']);
      } else {
        cli.emit('out', [this[arg]]);
      }
    });
  };
}
