import { createReadStream, createWriteStream } from 'fs';
import { Plugin } from '../plugin.js';
import { cliDescriptor } from './constants.js';
import { stdout } from 'process';
import { OPERATION_FAILED_ERROR } from '../constants.js';
import fs from 'fs/promises';
import { yellow } from '../../utils/consoleColors.js';
import path from 'path';

export class FsPlugin extends Plugin {
  constructor(...args) {
    super('fs', cliDescriptor, ...args);
    this.#initListeneters();
  }

  #catHandler = async (pathToFile) => {
    const { cli, navigator } = this.fileManager._plugins;

    const { resolvedPath, exists, isFile } = await navigator.resolvePath(pathToFile);

    if (!exists || !isFile) {
      cli.emit('error', OPERATION_FAILED_ERROR, 'Source path is not a file');
      return;
    }

    if (exists && isFile) {
      createReadStream(resolvedPath)
        .on('end', () => {
          stdout.write('\n');
          cli.emit('operationEnd');
        })
        .on('error', () => {
          cli.emit('error', OPERATION_FAILED_ERROR);
        })
        .pipe(stdout);
    }
  };

  #addHandler = async (pathToFile) => {
    const { cli, navigator } = this.fileManager._plugins;

    const { resolvedPath, exists } = await navigator.resolvePath(pathToFile);

    if (exists) {
      cli.emit('error', OPERATION_FAILED_ERROR, 'File already exists');
      return;
    }

    try {
      await fs.writeFile(resolvedPath, '');
      cli.emit('out', [`File created. Path to file: ${yellow(resolvedPath)}`]);
    } catch {
      cli.emit('error', OPERATION_FAILED_ERROR);
    }
  };

  #rnHandler = async (sourcePath, destPath) => {
    const { cli, navigator } = this.fileManager._plugins;

    const src = await navigator.resolvePath(sourcePath);

    if (!src.exists || !src.resolvedPath) {
      cli.emit('error', OPERATION_FAILED_ERROR, 'File or directory does not exist');
      return;
    }

    const dest = await navigator.resolvePath(destPath);

    if (dest.exists) {
      cli.emit('error', OPERATION_FAILED_ERROR, 'File or directory with such name already exists');
      return;
    }

    try {
      await fs.rename(src.resolvedPath, dest.resolvedPath);
      cli.emit('out', [`File renamed. Path to file: ${yellow(dest.resolvedPath)}`]);
    } catch (e) {
      console.log(e.message);
      cli.emit('error', OPERATION_FAILED_ERROR);
    }
  };

  #copyFile = async (sourcePath, destPath) => {
    const { navigator } = this.fileManager._plugins;

    let result = {
      src: null,
      dest: null,
      error: null,
      newPath: null,
    };

    result.src = await navigator.resolvePath(sourcePath);

    if (!result.src.exists || !result.src.resolvedPath) {
      result.error = ['error', OPERATION_FAILED_ERROR, 'File does not exist'];
      return result;
    }

    if (!result.src.isFile) {
      result.error = ['error', OPERATION_FAILED_ERROR, 'Source is not a file'];
      return result;
    }

    result.dest = await navigator.resolvePath(destPath);

    if (!result.dest.exists) {
      result.error = ['error', OPERATION_FAILED_ERROR, 'Destination directory does not exist'];
      return result;
    }

    if (!result.dest.isDir) {
      result.error = ['error', OPERATION_FAILED_ERROR, 'Destination is not a directory'];
      return result;
    }

    result.newPath = path.join(result.dest.resolvedPath, result.src.name);

    const { exists, resolvedPath } = await navigator.resolvePath(result.newPath);

    if (exists) {
      result.error = [
        'error',
        OPERATION_FAILED_ERROR,
        `Destination directory already contains file with such name: ${yellow(resolvedPath)}`,
      ];
      return result;
    }

    return new Promise((resolve) => {
      createReadStream(result.src.resolvedPath)
        .on('end', () => {
          resolve(result);
        })
        .on('error', () => {
          result.error = ['error', OPERATION_FAILED_ERROR];
          resolve(result);
        })
        .pipe(createWriteStream(result.newPath));
    });
  };

  #cpHandler = async (sourcePath, destPath) => {
    const { cli } = this.fileManager._plugins;
    const { error, newPath } = await this.#copyFile(sourcePath, destPath);

    if (error) {
      cli.emit(...error);
      return;
    }

    cli.emit('out', [`File copied. Path to file: ${yellow(newPath)}`]);
  };

  #rmHandler = async (pathToFile) => {
    const { cli, navigator } = this.fileManager._plugins;

    const { resolvedPath, exists, isFile } = await navigator.resolvePath(pathToFile);

    if (!exists) {
      cli.emit('error', OPERATION_FAILED_ERROR, 'File does not exist');
      return;
    }

    if (!isFile) {
      cli.emit('error', OPERATION_FAILED_ERROR, 'Path is not a file');
      return;
    }

    try {
      await fs.unlink(resolvedPath, '');
      cli.emit('out', [`${yellow(resolvedPath)} has been removed`]);
    } catch {
      cli.emit('error', OPERATION_FAILED_ERROR);
    }
  };

  #mvHandler = async (sourcePath, destPath) => {
    const { error, src, newPath } = await this.#copyFile(sourcePath, destPath);
    const { cli } = this.fileManager._plugins;

    if (error) {
      cli.emit(...error);
      return;
    }

    fs.unlink(src.resolvedPath, '')
      .then(() => {
        cli.emit('out', [`File moved. Path to file: ${yellow(newPath)}`]);
      })
      .catch(() => {
        cli.emit('error', OPERATION_FAILED_ERROR);
      });
  };

  #initListeneters = () => {
    this.on('cat', this.#catHandler);
    this.on('add', this.#addHandler);
    this.on('rn', this.#rnHandler);
    this.on('cp', this.#cpHandler);
    this.on('rm', this.#rmHandler);
    this.on('mv', this.#mvHandler);
  };
}
