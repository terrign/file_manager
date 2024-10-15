import { blue, green } from '../../utils/consoleColors.js';
import { PATH_PARAM_DESC } from '../constants.js';

const catHelp = `${blue`cat`} ${green(
  '[path_to_file]'
)} - read file and print it's content in console
${green(`path_to_file`)} - ${PATH_PARAM_DESC} to file`;

const addHelp = `${blue`add`} ${green(
  '[new_file_name]'
)} - create empty file in current working directory
${green(`new_file_name`)} - name of the file`;

const rnHelp = `${blue`rn`} ${green('[path_to_file] [new_file_name]')} - rename file
${green(`path_to_file`)} - ${PATH_PARAM_DESC} to file
${green(`new_file_name`)} - new name of the file`;

const cpHelp = `${blue`cp`} ${green('[path_to_file] [path_to_new_directory]')} - copy file
${green(`path_to_file`)} - ${PATH_PARAM_DESC} to file
${green(`new_file_name`)} - ${PATH_PARAM_DESC} to copy directory`;

const rmHelp = `${blue`rm`} ${green('[path_to_file]')} - delete file
${green(`new_file_name`)} - ${PATH_PARAM_DESC} to file`;

const mvHelp = `${blue`mv`} ${green('[path_to_file] [path_to_new_directory]')} - move file
${green(`path_to_file`)} - ${PATH_PARAM_DESC} to file
${green(`new_file_name`)} - ${PATH_PARAM_DESC} to copy directory`;

const cliDescriptor = {
  cat: {
    event: 'cat',
    args: { 0: '*' },
    help: catHelp,
  },
  add: {
    event: 'add',
    args: { 0: '*' },
    help: addHelp,
  },
  rn: {
    event: 'rn',
    args: { 0: '*', 1: '*' },
    help: rnHelp,
  },
  cp: {
    event: 'cp',
    args: { 0: '*', 1: '*' },
    help: cpHelp,
  },
  rm: {
    event: 'rm',
    args: { 0: '*' },
    help: rmHelp,
  },
  mv: {
    event: 'mv',
    args: { 0: '*', 1: '*' },
    help: mvHelp,
  },
};

export { cliDescriptor };
