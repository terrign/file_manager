import { pipeline } from 'stream/promises';
import { Plugin } from '../plugin.js';
import zlib from 'zlib';
import { createReadStream, createWriteStream } from 'fs';
import { OPERATION_FAILED_ERROR } from '../constants.js';
import { cliDescriptor } from './constants.js';
import { yellow } from '../../utils/consoleColors.js';

export class ZipPlugin extends Plugin {
  constructor(...args) {
    super('zip', cliDescriptor, ...args);
    this.on('compress', this.#compressHandler);
    this.on('decompress', this.#decompressHandler);
  }

  #validateArgs = async (pathToFile, pathToDest) => {
    const { navigator, cli } = this.fileManager._plugins;

    const src = await navigator.resolvePath(pathToFile);
    if (!src.resolvedPath || !src.exists) {
      cli.emit('error', OPERATION_FAILED_ERROR, 'Source path does not exist');
      return;
    }

    if (!src.isFile) {
      cli.emit('error', OPERATION_FAILED_ERROR, 'Source path is not a file');
      return;
    }

    const dest = await navigator.resolvePath(pathToDest);

    if (!dest.resolvedPath) {
      cli.emit('error', OPERATION_FAILED_ERROR, 'Incorrect destination path');
      return;
    }

    if (dest.exists) {
      cli.emit('error', OPERATION_FAILED_ERROR, 'Destination path already exists');
      return;
    }

    return { src, dest };
  };

  #compressHandler = async (pathToFile, pathToDest) => {
    const { cli } = this.fileManager._plugins;

    const validated = await this.#validateArgs(pathToFile, pathToDest);

    if (!validated) {
      return;
    }

    const { src, dest } = validated;
    dest.resolvedPath += dest.resolvedPath.endsWith('.br') ? '' : '.br';

    pipeline(
      createReadStream(src.resolvedPath),
      zlib.createBrotliCompress(),
      createWriteStream(dest.resolvedPath)
    )
      .then(() => {
        cli.emit('out', [`File compressed. Path to file: ${yellow(dest.resolvedPath)}`]);
      })
      .catch((err) => {
        cli.emit('error', OPERATION_FAILED_ERROR, err.message);
      });
  };

  #decompressHandler = async (pathToFile, pathToDest) => {
    const { cli } = this.fileManager._plugins;

    const validated = await this.#validateArgs(pathToFile, pathToDest);

    if (!validated) {
      return;
    }

    const { src, dest } = validated;

    pipeline(
      createReadStream(src.resolvedPath),
      zlib.createBrotliDecompress(),
      createWriteStream(dest.resolvedPath)
    )
      .then(() => {
        cli.emit('out', [`File decompressed. Path to file: ${yellow(dest.resolvedPath)}`]);
      })
      .catch((err) => {
        cli.emit('error', OPERATION_FAILED_ERROR, err.message);
      });
  };
}
