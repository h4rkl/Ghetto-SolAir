import * as anchor from '@project-serum/anchor';
import { actions, Wallet } from '@metaplex/js';
import { stringifyPubkeysAndBNsInObject } from './helpers/parse';

export async function NFTMintMaster(wallet: Wallet, uri: string, maxSupply?: number) {
  // @ts-ignore
  const connection = new anchor.web3.Connection(
    //@ts-ignore
    customRpcUrl || getCluster(env),
  );
  const result = await actions.mintNFT({
    connection,
    wallet,
    uri,
    maxSupply,
  });
  const strResult = stringifyPubkeysAndBNsInObject(result);
  console.log('Minted a new master NFT:', strResult);
  return strResult;
}
