#!/usr/bin/env node

// From https://github.com/moshthepitt/solana-nft-uploader
import { appendFile, readdir, readFile, writeFile } from "fs/promises";
import path from 'path';
import Arweave from 'arweave';
import { program } from 'commander';
import {
    ARWEAVE_URI,
    ARWEAVE_PROTOCOL,
    EXTENSION_JSON,
    EXTENSION_IMAGE,
    doUpload,
    getImageType,
    loadCache,
    saveCache,
    sleep,
} from './helpers/misc';
import type { Nft, CacheItem } from './types';

/**
 * Needs an Arweva wallet for the key
 */

program.version('0.0.1');

program
    .command('upload')
    .argument('<directory>', 'Directory containing images named from 0-n', (val) => val)
    .option('-e, --env <string>', 'Solana cluster env name. One of: mainnet-beta, testnet, devnet', 'devnet')
    .option('-k, --key <path>', `Arweave wallet location`, '--Arweave wallet not provided')
    .option('-c, --cache-name <string>', 'Cache file name', 'temp')
    .action(async (directory: string, options) => {
        const { key, env, cacheName } = options;

        const arweave = Arweave.init({
            host: ARWEAVE_URI,
            port: 443,
            protocol: ARWEAVE_PROTOCOL,
            timeout: 20000,
            logging: false,
        });        
        const jwkkey = await readFile(key, "utf8");
        const jwk = JSON.parse(jwkkey);
        const files = await readdir(directory);    
        arweave.wallets.jwkToAddress(jwk).then((address) => {
            console.log('-------------', address);
        });    

        const imageFiles = files.filter((it) => EXTENSION_IMAGE.includes(path.extname(it)));
        const jsonFiles = files.filter((it) => EXTENSION_JSON === path.extname(it));
        const imageFileCount = imageFiles.length;
        const jsonFileCount = jsonFiles.length;

        if (imageFileCount !== jsonFileCount) {
            throw new Error(
                `number of image files (${imageFileCount}) is different from the number of json files (${jsonFileCount})`,
            );
        }

        const cacheContent = loadCache(cacheName, env);
        const existingMap = new Map<string, CacheItem>(Object.entries(cacheContent.items));

        for (let i = 0; i < imageFileCount; i++) {
            const image = imageFiles[i];
            const imageName = path.basename(image);
            const index = imageName.replace(path.extname(imageName), '');

            console.log(`Processing file: ${index}`);

            if (!existingMap.get(index)) {
                console.log(`Uploading image: ${imageName}`);
                const imageType = getImageType(imageName);
                const file = await readFile(path.join(directory, image));
                const imageTx = await doUpload(
                    arweave,
                    file,
                    imageType,
                    jwk,
                    true,
                );
                // const imageUri = `${ARWEAVE_PROTOCOL}://${ARWEAVE_URI}/${imageTx.id}`;
                // console.log('Image uploaded to ', imageUri);

                // const manifestPath = image.replace(path.extname(image), '.json');
                // console.log(`Uploading manifest: ${manifestPath}`);
                // const manifestContent = fs.readFileSync(path.join(directory, manifestPath)).toString();
                // const manifest: Nft = JSON.parse(manifestContent);
                // manifest.image = imageUri;
                // manifest.properties.files[0].uri = imageUri;
                // manifest.properties.files[0].type = imageType;
                // const manifestTx = await doUpload(arweave, JSON.stringify(manifest), 'application/json', jwk);
                // const mainfestUri = `${ARWEAVE_PROTOCOL}://${ARWEAVE_URI}/${manifestTx.id}`;
                // console.log('Manifest uploaded to ', mainfestUri);

                // console.log('Setting cache for ', index);
                // cacheContent.items[index] = {
                //     imageUri,
                //     link: mainfestUri,
                //     name: manifest.name,
                //     onChain: false,
                // };
                // saveCache(cacheName, env, cacheContent);
                // sleep(500);
            } else {
                console.log(`Skipping file: ${index}, already exists`);
            }
        }
    });

program.parse(process.argv);