const util = require('util');

const writeLine = (prefix, msg, stream) => {
  stream.write(`[squidex-client-manager][${prefix}]: ${msg}\n`);
};

/**
 * Write a debug message
 *
 * @param {the message to write} msg
 */
function Debug(msg) {
  if (process.env.PRODUCTION) {
    return;
  }
  writeLine('debug', msg, process.stdout);
}

/**
 * Write a info message to standard output
 * @param {the message to write} msg
 */
const Info = msg => writeLine('info', msg, process.stdout);

/**
 * Write a error message to standard output
 * @param {the message to write} msg
 */
const Error = (error) => {
  writeLine('error', error, process.stdout);
  if (error.stack) {
    writeLine('stack', error.stack, process.stdout);
  }
};

/**
 * Write out a message before exiting current process
 * @param {string to print out} msg
 * @param {error to be printed} err
 * @param {exitCode the code to be used for the process}
 */
const bail = (msg, err, exitCode) => {
  Info(msg);
  Error(err);

  if (exitCode) {
    process.exit(exitCode);
  } else {
    process.exit(1);
  }
};

const inspect = (prefix, object) => {
  Info(`${prefix} inspecting ${util.inspect(object)}`);
};

module.exports.Log = {
  Debug,
  Info,
  Error,
  bail,
  inspect,
};
