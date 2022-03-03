const shell = require("shelljs");
const _ = require("lodash");
const fetch = require("node-fetch");
const fs = require("fs");
const { deleteFile } = require("./index");
const {
  Metadata
} = require("@metaplex-foundation/mpl-token-metadata");
const { Connection } = require("@solana/web3.js");

const ENDPOINTS = {
  DEV: "https://api.devnet.solana.com",
  TEST: "https://api.testnet.solana.com",
  MAIN: "https://api.mainnet-beta.solana.com",
};

/**
 * 
 * @param {PubKey} publicAddress and Solana NFT owner account
 * @param {ENDPOINTS} network one of DEV, TEST or MAIN
 */
const getNFTList = async (publicAddress, network) => {
  const connect = network
    ? ENDPOINTS[network]
    : "https://api.devnet.solana.com";
  const connection = new Connection(connect);
  try {
    const errors = [];
    const nftMeta = await Metadata.findDataByOwner(connection, publicAddress);
    const accNFTs = await Promise.all(
      nftMeta.map(async (metadata, i) => {
        console.log(`Fetch meta for ${metadata.data.uri}`);
        const NFTData = await fetch(metadata.data.uri).then((response) =>
          response.json()
        );
        console.log(`Meta fetched for ${metadata.data.uri} at index ${i}`);
        return { mint: metadata.mint, ...NFTData };
      })
    );
    deleteFile("data/NFT/nft-list.json");
    fs.appendFile(
      "data/NFT/nft-list.json",
      JSON.stringify(accNFTs),
      function (err) {
        if (err) throw new Error(err);
        console.log(`Converted ${accNFTs.length} records`);
      }
    );
  } catch (error) {
    console.log(error);
  }
};

/**
 * The name and family object in the collection meta
 * @param {string} name
 * @param {string} family 
 */
const filterCollection = (name, family) => {
  const d = require("./data/NFT/nft-list.json");
  console.log(`Data contains ${d.length} records`);
  const collection = d
    .map((nftData) => {
      if (
        nftData?.collection !== undefined &&
        nftData?.collection?.name === name &&
        nftData?.collection?.family === family
      ) {
        return {
          mint: nftData.mint,
          collection: `${nftData?.collection?.name}-${nftData?.collection?.family}`,
        };
      }
      return;
    })
    .filter((pk) => !!pk);
  deleteFile("data/NFT/collection.json");
  fs.appendFile(
    "data/NFT/collection.json",
    JSON.stringify(collection),
    function (err) {
      if (err) throw new Error(err);
      console.log(`Collection contains ${collection.length} records`);
    }
  );
};

/**
 * WARNING!!!!!
 * This will execute your NFT transfer
 * @param {PubKey} address the owner account you want to bulk send the NFTs to
 */
const exeNFTDrop = (address) => {
  const d = require("./data/NFT/collection.json");
  const errors = [];
  _.forEach(d, (v, i) => {
    console.log(
      `Sending ${JSON.stringify(v)} to ${address} at count: ${i+1}/${d.length} recipients`
    );
    // Execute the NFT transfer here
    shell.exec(
      `spl-token transfer ${v.mint} 1 ${address} --fund-recipient --allow-unfunded-recipient`
    );
    // Push any accounts that have errors
    if (shell.error()) {
      errors.push(v);
    }
  });
  // Write the error file - should be [] if none
  deleteFile("data/NFT/errors.json");
  fs.appendFile("data/NFT/errors.json", JSON.stringify(errors), function (err) {
    if (err) return console.log(err);
    console.log("Errors");
  });
};

module.exports = {
  exeNFTDrop,
  filterCollection,
  getNFTList,
};
