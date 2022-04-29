import log from 'loglevel';
import { program } from "commander";

export function programCommand(
    name: string,
    options: { requireWallet: boolean } = { requireWallet: true },
  ) {
    let cmProgram = program
      .command(name)
      .option(
        '-e, --env <string>',
        'Solana cluster env name',
        'devnet', //mainnet-beta, testnet, devnet
      )
      .option('-l, --log-level <string>', 'log level', setLogLevel)
      .option('-c, --cache-name <string>', 'Cache file name', 'temp');
  
    if (options.requireWallet) {
      cmProgram = cmProgram.requiredOption(
        '-k, --keypair <path>',
        `Solana wallet location`,
      );
    }
  
    return cmProgram;
  }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setLogLevel(value, prev) {
    if (value === undefined || value === null) {
      return;
    }
    log.info('setting the log value to: ' + value);
    log.setLevel(value);
  }