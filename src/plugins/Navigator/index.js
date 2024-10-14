import { yellow } from '../../utils/consoleColors.js';
import { Plugin } from '../plugin.js';
import { homedir } from 'os';
import fs from 'fs/promises';
import path from 'path';
import { OPERATION_FAILED_ERROR } from '../constants.js';
import { cliDescriptor } from './constants.js';

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

  resolvePath = async (pathArg) => {
    let result = {
      resolvedPath: null,
      isDir: null,
      isFile: null,
      exists: false,
      error: null,
      name: null,
      ext: null,
    };
    try {
      result.resolvedPath = path.resolve(this.#currentDir, pathArg);
      result.exists = await this.#exists(result.resolvedPath);
      if (result.exists) {
        const stats = await fs.lstat(result.resolvedPath);
        result.isDir = stats.isDirectory();
        result.isFile = stats.isFile();
        result.name = path.basename(result.resolvedPath);
      }
    } catch (e) {
      result.error = e;
    }
    return result;
  };

  #exists = (path) =>
    fs
      .access(path)
      .then(() => true)
      .catch(() => false);

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

      const { exists, isFile } = await this.resolvePath(fullPath);

      if (exists) {
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

    const { resolvedPath } = await this.resolvePath('..');

    if (resolvedPath) {
      this.#currentDir = resolvedPath;
      cli.emit('operationEnd');
    }
  };

  #cdHandler = async (pathArg) => {
    const { cli } = this.fileManager._plugins;

    if (pathArg === '..') {
      this.#upHandler();

      return;
    }

    const { resolvedPath, isDir } = await this.resolvePath(pathArg);

    if (!isDir || !resolvedPath) {
      cli.emit('error', OPERATION_FAILED_ERROR, 'Directory does not exist');
      return;
    }

    if (resolvedPath) {
      this.#currentDir = resolvedPath;
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
