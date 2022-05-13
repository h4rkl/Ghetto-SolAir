# Uploading to Arweave

## ArweaveJS

To use the arweave js tools you need to have an arweave wallet. I haven't figured out how to use a SOL wallet with Arweave JS yet.

## Arloade

There is a package called arweaver which allows you to use your SOL wallet to upload to Arweave.

- Load single PNG: `arloader upload ~/Sites-c/solana-tools/packages/cli/img/0.png --with-sol --sol-keypair-path $HARKL --ar-default-keypair --no-bundle`
- Update the meta with the img URL - make sure to add `?ext=png` to eng of arweave url img
- Format JSON into a single line
- Load single JSON: `arloader upload /home/ezy/Sites-c/solana-tools/packages/cli/img/0.json --with-sol --sol-keypair-path $HARKL --ar-default-keypair --no-bundle`
- MintNFT: `ts-node ~/Sites-c/solana-tools/packages/cli/src/nft-tools.ts mintNFT https://arweave.net/m_rLk-ffSRmi5ZFfFxF2DiCTdSfLPMafAsVQs6zhiyQ -e mainnet-beta -k $HARKL`

Once this is done use the mintNFT method with the hardcoded files for meta and image.
