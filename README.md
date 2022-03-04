# Ghetto SolAir 🪂

A guerilla tactix command lined based airdrop tool for Solana with no polish and max functionality.

## Quickstart setup

- Setup the [Solana Tool Suite](https://docs.solana.com/cli/install-solana-cli-tools)
- Setup [spl-token](https://spl.solana.com/token)
- Set your config to the network you'll airdrop on eg. test-net `solana config set --url https://api.testnet.solana.com`
- Make sure your Keypair Path is correct for the token you'll be airdropping `solana config get`
- Make sure your account has enough SOL to pay for the airdrop

## Airdrop tool and file-cleaner

A tool for bulk airdropping Solana tokens to a list of JSON or CSV addresses. I used Google forms to collect addresses and the example output is located at `data/example.csv`. You can use this format or adjust to your own flavour.

- `cd data && mv example.csv raw.csv`
- `npm run csvToJSON`
- `npm run validateKeys`
- `npm run removeDupes`
- `npm run bulkToken`

### Methods

- **csvToJSON** - converts a CSV file of data to JSON with specific headers
- **validateKeys** - removes any non-Solana keys
- **removeDupes** - removes duplicate keys from list
- **bulkTokenCSV** - create a CSV of the cleaned data
- **airdrop:test** - test airdrop function
- **airdrop:danger** - airdrop function complete with error log list for unsuccessful sends (tends to add last few sends to errors list so sanity check the pubKeys before doubling up)

## NFT bulk sender

A tool to bulk send a whole array of NFTs from your wallet programatically.

### Methods

- **getNFTList** - gets all NFTs in a Solana pubkey account in JSON format
- **filterCollection** - filters the list by collection
- **nftdrop:test** - test your NFT drop between accounts
- **nftdrop:danger** - execute your NFT drop

## Recover Solflare keypair from wallet

You can recover Solflare addresses uising the following prompt pattern where n is the wallet address position:

`solana-keygen recover "prompt://?full-path=m/44'/501'/<n>'/0'"`

eg. `solana-keygen recover "prompt://?full-path=m/44'/501'/6'/0'" -o 1303.json`
