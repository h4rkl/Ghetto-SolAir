const shell = require("shelljs");
const _ = require("lodash");
const fetch = require("node-fetch");
const fs = require("fs");
const { deleteFile } = require("./index");
const {
  Metadata,
  MetadataProgram,
} = require("@metaplex-foundation/mpl-token-metadata");
const { Connection, PublicKey } = require("@solana/web3.js");

const ENDPOINTS = {
  DEV: "https://api.devnet.solana.com",
  TEST: "https://api.testnet.solana.com",
  MAIN: "https://api.mainnet-beta.solana.com",
  SERUM: "https://solana-api.projectserum.com",
  GEN: "https://ssc-dao.genesysgo.net",
};

/**
 * These methods weren't working because the RPC request was too heavy
 */

/**
 * Get all the token ids in a CM. The CandyMachine id can be found in the "Metaplex NFT Candy Machine v2 instruction"
 * where the "#1 - Account0 " is typically the CMv2 pubkey.
 * https://stackoverflow.com/questions/70597753/how-to-find-all-nfts-minted-from-a-v2-candy-machine
 * @param {*} candyMachineId
 */
const getCM1NFTs = async (candyMachineId, network) => {
  const MAX_NAME_LENGTH = 32;
  const MAX_URI_LENGTH = 200;
  const MAX_SYMBOL_LENGTH = 10;
  const MAX_CREATOR_LEN = 32 + 1 + 1;
  const connect = network
    ? ENDPOINTS[network]
    : "https://api.devnet.solana.com";
  const connection = new Connection(connect);
  console.log(connection);
  const metadataAccounts = await MetadataProgram.getProgramAccounts(
    connection,
    {
      filters: [
        {
          memcmp: {
            offset:
              1 +
              32 +
              32 +
              4 +
              MAX_NAME_LENGTH +
              4 +
              MAX_URI_LENGTH +
              4 +
              MAX_SYMBOL_LENGTH +
              2 +
              1 +
              4 +
              0 * MAX_CREATOR_LEN,
            bytes: candyMachineId,
          },
        },
      ],
    }
  );

  const mintHashes = [];

  for (let index = 0; index < metadataAccounts.length; index++) {
    const account = metadataAccounts[index];
    const accountInfo = await connection.getParsedAccountInfo(account.pubkey);
    const metadata = new Metadata(candyMachineId.toString(), accountInfo.value);
    mintHashes.push(metadata.data.mint);
  }
  console.log(mintHashes);
  deleteFile(`data/NFT/nfts-${candyMachineId}.json`);
  fs.appendFile(
    `data/NFT/nfts-${candyMachineId}.json`,
    JSON.stringify(mintHashes),
    function (err) {
      if (err) throw new Error(err);
      console.log(
        `nfts-${candyMachineId} contains ${mintHashes.length} records`
      );
    }
  );
};

/**
 * Get all the token ids in a CM. The CandyMachine id can be found in the "Metaplex NFT Candy Machine v2 instruction"
 * where the "#1 - Account0 " is typically the CMv2 pubkey.
 * https://stackoverflow.com/questions/70597753/how-to-find-all-nfts-minted-from-a-v2-candy-machine
 * @param {*} candyMachineId
 */
const getCM2NFTs = async (candyMachineId, network) => {
  const connect = network
    ? ENDPOINTS[network]
    : "https://api.devnet.solana.com";
  const connection = new Connection(connect);
  const MAX_NAME_LENGTH = 32;
  const MAX_URI_LENGTH = 200;
  const MAX_SYMBOL_LENGTH = 10;
  const MAX_CREATOR_LEN = 32 + 1 + 1;

  const TOKEN_METADATA_PROGRAM = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );
  candyMachineId = new PublicKey(candyMachineId);

  async function getProgramAccounts(
    connection,
    programId,
    configOrCommitment,
  ) {
    const extra = {};
    let commitment;
    //let encoding;
  
    if (configOrCommitment) {
      if (typeof configOrCommitment === 'string') {
        commitment = configOrCommitment;
      } else {
        commitment = configOrCommitment.commitment;
        //encoding = configOrCommitment.encoding;
  
        if (configOrCommitment.dataSlice) {
          extra.dataSlice = configOrCommitment.dataSlice;
        }
  
        if (configOrCommitment.filters) {
          extra.filters = configOrCommitment.filters;
        }
      }
    }
  
    const args = connection._buildArgs([programId], commitment, 'base64', extra);
    const unsafeRes = await (connection)._rpcRequest(
      'getProgramAccounts',
      args,
    );
    //console.log(unsafeRes)
    const data = (
      unsafeRes.result
    ).map(item => {
      return {
        account: {
          // TODO: possible delay parsing could be added here
          data: Buffer.from(item.account.data[0], 'base64'),
          executable: item.account.executable,
          lamports: item.account.lamports,
          // TODO: maybe we can do it in lazy way? or just use string
          owner: item.account.owner,
        },
        pubkey: item.pubkey,
      };
    });
  
    return data;
  }

  const getAccountsByCreatorAddress = async (creatorAddress) => {
    const metadataAccounts = await getProgramAccounts(
      connection,
      TOKEN_METADATA_PROGRAM.toBase58(),
      {
        filters: [
          {
            memcmp: {
              offset:
                1 + // key
                32 + // update auth
                32 + // mint
                4 + // name string length
                MAX_NAME_LENGTH + // name
                4 + // uri string length
                MAX_URI_LENGTH + // uri*
                4 + // symbol string length
                MAX_SYMBOL_LENGTH + // symbol
                2 + // seller fee basis points
                1 + // whether or not there is a creators vec
                4 + // creators vec length
                0 * MAX_CREATOR_LEN,
              bytes: creatorAddress,
            },
          },
        ],
      }
    );
    const decodedAccounts = [];
    for (let i = 0; i < metadataAccounts.length; i++) {
      const e = metadataAccounts[i];
      const decoded = await decodeMetadata(e.account.data);
      const accountPubkey = e.pubkey;
      const store = [decoded, accountPubkey];
      decodedAccounts.push(store);
    }

    console.log(
      `Found ${
        decodedAccounts.length
      } token account(s) for wallet ${creatorAddress.toBase58()}: `
    );
    console.log("-----------------", metadataAccounts);
    return decodedAccounts;
  };

  /**
   * This is typically "#2 - Account1" in "Metaplex NFT Candy Machine V2" instruction
   * @param {pubkey string} candyMachine
   * @returns keypair
   */
  const getAddressesByCreatorAddress = async (candyMachineAddr, connection) => {
    const accountsByCreatorAddress = await getAccountsByCreatorAddress(
      candyMachineAddr,
      connection
    );
    const addresses = accountsByCreatorAddress.map((it) => {
      return new PublicKey(it[0].mint).toBase58();
    });

    return addresses;
  };

  const mintHashes = await getAddressesByCreatorAddress(candyMachineId);
  console.log(mintHashes);
  deleteFile(`data/NFT/nfts-${candyMachineId}.json`);
  fs.appendFile(
    `data/NFT/nfts-${candyMachineId}.json`,
    JSON.stringify(mintHashes),
    function (err) {
      if (err) throw new Error(err);
      console.log(
        `nfts-${candyMachineId} contains ${mintHashes.length} records`
      );
    }
  );
};

module.exports = {
  getCM1NFTs,
  getCM2NFTs,
};
