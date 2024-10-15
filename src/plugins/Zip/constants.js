import { blue, green } from '../../utils/consoleColors.js';

import { PATH_PARAM_DESC } from '../constants.js';

const compressHelp = `${blue`compress`} ${green(
  '[path_to_file] [path_to_destination]'
)} - compress file using Brotli algorithm
${green(`path_to_file`)} - ${PATH_PARAM_DESC} to file
${green(`path_to_destination`)} - ${PATH_PARAM_DESC} to file`;

const decompressHelp = `${blue`decompress`} ${green(
  '[path_to_file] [path_to_destination]'
)} - decompress file using Brotli algorithm
${green(`path_to_file`)} - ${PATH_PARAM_DESC} to file
${green(`path_to_destination`)} - ${PATH_PARAM_DESC} to file`;

const cliDescriptor = {
  compress: {
    event: 'compress',
    args: { 0: '*', 1: '*' },
    help: compressHelp,
  },
  decompress: {
    event: 'decompress',
    args: { 0: '*', 1: '*' },
    help: decompressHelp,
  },
};

export { cliDescriptor };
