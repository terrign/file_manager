import { blue, green, yellow } from '../../utils/consoleColors.js';
import { Plugin } from '../plugin.js';
import { homedir } from 'os';
import fs from 'fs/promises';
import path from 'path';
import { OPERATION_FAILED_ERROR } from '../constants.js';

const cdHelp = `${blue`cd`} ${green('[path_to_directory]')} - changes directory to specified path
${green(`path_to_directory`)} - relative or absolute path to directory`;

const upHelp = `${blue`up`} - one directory up (when you are in the root folder this operation has no effect)`;

const cliDescriptor = {
  up: {
    event: 'up',
    args: null,
    help: upHelp,
  },
  cd: {
    event: 'cd',
    args: [{ 0: '*' }],
    help: cdHelp,
  },
  ls: {
    event: 'ls',
    args: null,
    help: blue`ls` + ' - lists all files and folders in current directory',
  },
};

export class NavigatorPlugin extends Plugin {
  #homeDir = homedir();
  #currentDir = this.#homeDir;
  constructor(...args) {
    super('navigator', cliDescriptor, ...args);
    this.#currentDir = this.#homeDir;
    this.#initEvents();
  }

  get dir() {
    return this.#currentDir;
  }

  get currentDirMessage() {
    return `You are currently in ${yellow(this.#currentDir)} directory\n`;
  }

  hasAccess = (path) =>
    fs
      .access(path)
      .then(() => true)
      .catch(() => false);

  resolvePath = async (pathArg) => {
    const { cli } = this.fileManager._plugins;
    try {
      const newPath = path.resolve(this.#currentDir, pathArg);

      if (!(await this.hasAccess(newPath))) {
        throw new Error('Invalid path');
      }

      return newPath;
    } catch (e) {
      cli.emit('error', OPERATION_FAILED_ERROR, e.message);

      return null;
    }
  };

  #lsHandler = async () => {
    let dir;
    const { cli } = this.fileManager._plugins;

    try {
      dir = await fs.readdir(this.#currentDir, { withFileTypes: true });
    } catch (e) {
      const { cli } = this.fileManager._plugins;
      cli.emit('error', 'Operation failed', e.message);

      return;
    }

    const res = [];

    for (const { parentPath, name } of dir) {
      const fullPath = path.join(parentPath, name);
      const [hasAccess, isFile] = await Promise.all([
        this.hasAccess(fullPath),
        fs.stat(fullPath).then((stat) => stat.isFile()),
      ]);

      if (hasAccess) {
        res.push({
          Name: name,
          Type: isFile ? 'file' : 'directory',
        });
      }
    }

    cli.emit('out', [res, 'table']);
  };

  #upHandler = async () => {
    const { cli } = this.fileManager._plugins;

    if (this.#currentDir === this.#homeDir) {
      cli.emit('operationEnd');

      return;
    }

    const newPath = await this.resolvePath('..');

    if (newPath) {
      this.#currentDir = newPath;
      cli.emit('operationEnd');
    }
  };

  #cdHandler = async (pathArg) => {
    const { cli } = this.fileManager._plugins;

    if (pathArg === '..') {
      this.#upHandler();

      return;
    }

    const newPath = await this.resolvePath(pathArg);
    if (newPath) {
      this.#currentDir = newPath;
      cli.emit('operationEnd');
    }
  };

  #initEvents = () => {
    this.on('ls', this.#lsHandler);
    this.on('up', this.#upHandler);
    this.on('cd', this.#cdHandler);

    const { cli } = this.fileManager._plugins;
    cli.on('operationEnd', () => {
      process.stdout.write(this.currentDirMessage);
    });
  };
}
