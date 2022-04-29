import * as anchor from "@project-serum/anchor";
import { actions, NodeWallet } from "@metaplex/js";
import { program } from "commander";
import { readFile } from "fs/promises";
import { clusterApiUrl, Keypair } from "@solana/web3.js";

program.version("0.0.1");

program
  .command("mintNFT")
  .argument("<uri>", "URI for metadata file", (val) => val)
  .option(
    "-e, --env <string>",
    "Solana cluster env name. One of: mainnet-beta, testnet, devnet",
    "devnet"
  )
  .option(
    "-k, --key <path>",
    `Sol wallet keypair`,
    "--Sol wallet keypair not provided"
  )
  .action(async (uri: string, options) => {
    const { key, env } = options;

    console.log(key, env, uri);
    const jwkkey = await readFile(key, "utf8");
    const jwk = JSON.parse(jwkkey);
    let seed = Uint8Array.from(jwk).slice(0, 32);
    const keypair = Keypair.fromSeed(seed);
    
    // @ts-ignore
    const connection = new anchor.web3.Connection(clusterApiUrl(env));
    const mint = await actions.mintNFT({
      connection,
      wallet: new NodeWallet(keypair),
      uri,
      maxSupply: 0
    });
    console.log(mint);
    console.log(`Minted a new master NFT || txId: ${mint.txId} || pubKey: ${mint.mint.toString()}`);
  });

program.parse(process.argv);
