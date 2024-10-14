import { blue, green } from '../../utils/consoleColors.js';
import { OPERATION_FAILED_ERROR, PATH_PARAM_DESC } from '../constants.js';
import { Plugin } from '../plugin.js';
import { createHash } from 'crypto';
import { createReadStream } from 'fs';

const hashHelp = `${blue`hash`} ${green(
  '[path_to_file]'
)} - calculate hash for file and prints it into console
${green(`path_to_file`)} - ${PATH_PARAM_DESC} to file`;

const cliDescriptor = {
  hash: {
    event: 'hash',
    args: [{ 0: '*', 1: '*' }],
    help: hashHelp,
  },
};
export class HashPlugin extends Plugin {
  constructor(...args) {
    super('hash', cliDescriptor, ...args);
    this.on('hash', this.#hashHandler);
  }

  #hashHandler = async (pathArg) => {
    const { cli } = this.fileManager._plugins;
    const { navigator } = this.fileManager._plugins;
    const pathToFile = await navigator.resolvePath(pathArg);
    if (pathToFile) {
      const hash = createHash('sha256');
      createReadStream(pathToFile)
        .on('data', (chunk) => {
          hash.update(chunk);
        })
        .on('end', () => {
          cli.emit('out', hash.digest('hex'));
        })
        .on('error', (e) => {
          cli.emit('error', OPERATION_FAILED_ERROR, e.message);
        });
    }
  };
}
