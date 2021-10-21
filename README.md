# Ghetto SolAir 🪂

A guerilla tactix command lined based airdrop tool for Solana with no polish and max functionality.

## Quickstart file-cleaner

I used Google forms to collect addresses and the example output is located at `data/example.csv`. You can use this format or adjust to your own flavour.

- `cd data && mv example.csv raw.csv`
- `npm run csvToJSON`
- `npm run validateKeys`
- `npm run removeDupes`
- `npm run bulkToken`

## Quickstart airdropper

- Setup the [Solana Tool Suite](https://docs.solana.com/cli/install-solana-cli-tools)
- Setup [spl-token](https://spl.solana.com/token)
- Set your config to the network you'll airdrop on eg. test-net `solana config set --url https://api.testnet.solana.com`
- Make sure your Keypair Path is correct for the token you'll be airdropping `solana config get`
- Make sure your account has enough SOL to pay for the airdrop
