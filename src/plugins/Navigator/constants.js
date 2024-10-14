import { blue, green } from '../../utils/consoleColors.js';

import { PATH_PARAM_DESC } from '../constants.js';

const cdHelp = `${blue`cd`} ${green('[path_to_directory]')} - change directory to specified path
${green(`path_to_directory`)} - ${PATH_PARAM_DESC} to directory`;

const upHelp = `${blue`up`} - one directory up (when you are in the root folder this operation has no effect)`;

const cliDescriptor = {
  up: {
    event: 'up',
    args: null,
    help: upHelp,
  },
  cd: {
    event: 'cd',
    args: { 0: '*' },
    help: cdHelp,
  },
  ls: {
    event: 'ls',
    args: null,
    help: blue`ls` + ' - lists all files and folders in current directory',
  },
};

export { cliDescriptor };
