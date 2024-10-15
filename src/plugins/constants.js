import { blue } from '../utils/consoleColors.js';

const INVALID_COMMAND_ERROR = 'Invalid input';
const OPERATION_FAILED_ERROR = 'Operation failed';
const HELP_SUGGESTION = blue`Try --help to see available commands`;
const PATH_PARAM_DESC = 'relative or absolute path';

export { INVALID_COMMAND_ERROR, HELP_SUGGESTION, OPERATION_FAILED_ERROR, PATH_PARAM_DESC };
