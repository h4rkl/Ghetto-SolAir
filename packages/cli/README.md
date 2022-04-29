# Uploading to Arweave

## ArweaveJS

To use the arweave js tools you need to have an arweave wallet. I haven't figured out how to use a SOL wallet with Arweave JS yet.

## Arloade

There is a package called arweaver which allows you to use your SOL wallet to upload to Arweave.

- Load single PNG: `arloader upload /home/ezy/Sites-c/solana-tools/packages/cli/img/0.png --with-sol --sol-keypair-path $HARKL --ar-default-keypair --no-bundle`
- Update the meta with the img URL
-- Load single JSON: `arloader upload /home/ezy/Sites-c/solana-tools/packages/cli/img/0.json --with-sol --sol-keypair-path $HARKL --ar-default-keypair --no-bundle`

Once this is done use the mintNFT method with the hardcoded files for meta and image.
