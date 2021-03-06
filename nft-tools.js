const shell = require("shelljs");
const { forEach } = require("lodash");
const fetch = require("node-fetch");
const fs = require("fs");
const { deleteFile } = require("./index");
const { Metadata } = require("@metaplex-foundation/mpl-token-metadata");
const { Connection, PublicKey } = require("@solana/web3.js");
const { Windex } = require("@wonka-labs/wonka-js");
const { AnyPublicKey } = require("@metaplex-foundation/mpl-core");

const ENDPOINTS = {
  DEV: "https://api.devnet.solana.com",
  TEST: "https://api.testnet.solana.com",
  MAIN: "https://api.mainnet-beta.solana.com",
  SERUM: "https://solana-api.projectserum.com",
  GEN: "https://ssc-dao.genesysgo.net",
};

/**
 * Gets all the NFTs and associated meta for a given wallet address. Useful for
 * inspecting a users wallet and getting all NFT meta.
 * @param {AnyPublicKey} publicAddress and Solana NFT owner account
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
        let NFTData;
        if (metadata?.data?.uri) {
          NFTData = await fetch(metadata.data.uri, null).then((response) =>
            response.json()
          );
        }
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
 * @param {number} count will cut the collection to a specific N value
 */
const filterCollection = (name, family, count) => {
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
  if (count) {
    collection.length = count;
  }
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
  forEach(d, (v, i) => {
    console.log(
      `Sending ${JSON.stringify(v)} to ${address} at count: ${i + 1}/${
        d.length
      } recipients`
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

/**
 * Get all the token ids in a CM. The CandyMachine id can be found in the "Metaplex NFT Candy Machine v2 instruction"
 * where the "#1 - Account0 " is typically the CMv2 pubkey.
 * https://stackoverflow.com/questions/70597753/how-to-find-all-nfts-minted-from-a-v2-candy-machine
 * @param {string} candyMachineId
 * @param {string} network should be 'MAIN' or 'DEV' - NB!!! has to use Windex endpoint
 */
const getCMAddresses = async (candyMachineId, network) => {
  const cmId = new PublicKey(candyMachineId);
  const endpoint =
    network === "MAIN" ? Windex.MAINNET_ENDPOINT : Windex.DEVNET_ENDPOINT;
  // console.log(endpoint, cmId);
  const fetchNFTsByCandyMachine = async (cmId) => {
    const nfts = await Windex.fetchNFTsByCandyMachineID(cmId, 5000, endpoint);
    console.log(`Retrieved ${nfts.length} NFTs!`);
    return nfts;
  };
  const hashes = await fetchNFTsByCandyMachine(cmId);
  const hashMap = hashes.map((nft) => nft.address);
  deleteFile(`data/NFT/${candyMachineId}-nfts.json`);
  fs.appendFile(
    `data/NFT/${candyMachineId}-nfts.json`,
    JSON.stringify(hashMap),
    function (err) {
      if (err) throw new Error(err);
      console.log(`Collection contains ${hashMap.length} records`);
    }
  );
};

/**
 * Tool for quickly making address obj in arr for the airdrop tool
 * @param {string} file
 */
const mapArrtoAddrObj = (file) => {
  const d = require(file);
  const addressed = d.map((a) => ({ address: a }));
  deleteFile(`data/addressed.json`);
  fs.appendFile(
    `data/addressed.json`,
    JSON.stringify(addressed),
    function (err) {
      if (err) throw new Error(err);
      console.log(`Collection contains ${addressed.length} records`);
    }
  );
};

/**
 * Get the mint info for token
 * @param {string} mintAddress
 * @param {ENDPOINTS} network
 */
const getNFTOwner = async (mintAddress, network) => {
  const connect = network
    ? ENDPOINTS[network]
    : "https://api.devnet.solana.com";
  const connection = new Connection(connect);
  const largestAccounts = await connection.getTokenLargestAccounts(
    new PublicKey(mintAddress)
  );
  const largestAccountInfo = await connection.getParsedAccountInfo(
    largestAccounts.value[0].address
  );
  return largestAccountInfo.value.data.parsed.info.owner;
};

/**
 * Get the NFT owners for a list of mint addresses
 * @param {string} file path to file
 * @param {ENDPOINTS} network
 */
const listNFTOwners = async (file, network) => {
  const connect = network
    ? ENDPOINTS[network]
    : "https://api.devnet.solana.com";
  const connection = new Connection(connect);
  try {
    const f = require(file);
    // Split file into groups of 40 to avoid the rate limit
    // const chunkSize = 39;
    // const chunked = [];
    // for (let i = 0; i < f.length; i += chunkSize) {
    //   const chunk = f.slice(i, i + chunkSize);
    //   chunked.push(chunk);
    // }
    const chunked = f;
    let accArr = [];
    const nftAccs = async () => {
      let index = 0;
      return await new Promise((resolve) => {
        const interval = setInterval(async function () {
          console.log(`Fetch Acc for ${chunked[index]} at index ${index}`);
          const largestAccounts = await connection.getTokenLargestAccounts(
            new PublicKey(chunked[index])
          );
          const largestAccountInfo = await connection.getParsedAccountInfo(
            largestAccounts.value[0].address
          );
          accArr.push(largestAccountInfo.value.data.parsed.info.owner);
          index++;
          if (index === chunked.length) {
            clearInterval(interval);
            resolve();
          }
        }, 400);
      });
      // return await new Promise((resolve) => {
      //   const interval = setInterval(async function () {
      //     await Promise.all(
      //       chunked[index++].map(async (mintAddress, i) => {
      //         console.log(
      //           `Fetch Acc for ${mintAddress} at index ${index} - ${i}`
      //         );
      //         const largestAccounts = await connection.getTokenLargestAccounts(
      //           new PublicKey(mintAddress)
      //         );
      //         const largestAccountInfo = await connection.getParsedAccountInfo(
      //           largestAccounts.value[0].address
      //         );
      //         accArr.push(largestAccountInfo.value.data.parsed.info.owner);
      //       })
      //     );
      //     if (index === chunked.length) {
      //       clearInterval(interval);
      //       resolve();
      //     }
      //   }, 1000);
      // });
    };
    await nftAccs();
    console.log("-----------", accArr.length);
    // setTimeout(function loopRequest() {
    //   setTimeout(loopRequest, 1000);
    //   console.log("boom");
    // }, 0);
    deleteFile("data/NFT/acc-nft-list.json");
    fs.appendFile(
      "data/NFT/acc-nft-list.json",
      JSON.stringify(accArr),
      function (err) {
        if (err) throw new Error(err);
        console.log(`Found ${accArr.length} records`);
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  exeNFTDrop,
  filterCollection,
  getNFTList,
  getCMAddresses,
  mapArrtoAddrObj,
  getNFTOwner,
  listNFTOwners,
};
