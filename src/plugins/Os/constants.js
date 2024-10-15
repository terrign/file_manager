import { blue, green } from '../../utils/consoleColors.js';

const help = `${blue('os')} ${green('[--arg]')} - get system info
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

export { cliDescriptor };
