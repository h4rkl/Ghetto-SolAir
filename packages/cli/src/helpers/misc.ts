import fs from 'fs';
import path from 'path';
import Arweave from 'arweave';
import type { CacheItems } from '../types';
import Transaction from 'arweave/node/lib/transaction';
import { JWKInterface } from 'arweave/node/lib/wallet';

export const ARWEAVE_URI = 'arweave.net';
export const ARWEAVE_PROTOCOL = 'https';
export const CACHE_PATH = './.cache';
const ENV = 'devnet';
const CACHE_NAME = 'temp';
export const EXTENSION_PNG = '.png';
export const EXTENSION_JPEG = '.jpeg';
export const EXTENSION_JPG = '.jpg';
export const EXTENSION_WEBP = '.webp';
export const EXTENSION_GIF = '.gif';
export const EXTENSION_IMAGE = [EXTENSION_PNG, EXTENSION_JPEG, EXTENSION_JPG, EXTENSION_GIF, EXTENSION_WEBP];
export const EXTENSION_JSON = '.json';

export const sleep = (ms: number): Promise<unknown> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export function cachePath(env: string = ENV, cacheName: string = CACHE_NAME): string {
    if (!fs.existsSync(CACHE_PATH)) {
        fs.mkdirSync(CACHE_PATH);
    }
    return path.join(CACHE_PATH, `${env}-${cacheName}.json`);
}

export function loadCache(cacheName: string, env: string): CacheItems {
    const path = cachePath(env, cacheName);
    const defaultJson = { items: {} };
    try {
        return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path).toString()) : { items: {} };
    } catch {
        return defaultJson;
    }
}

export function saveCache(cacheName: string, env: string, cacheContent: CacheItems): void {
    fs.writeFileSync(cachePath(env, cacheName), JSON.stringify(cacheContent));
}

export const getImageType = (filename: string): string => {
    if (filename.endsWith(EXTENSION_PNG)) {
        return 'image/png';
    } else if (filename.endsWith(EXTENSION_JPEG) || filename.endsWith(EXTENSION_JPG)) {
        return 'image/jpeg';
    } else if (filename.endsWith(EXTENSION_GIF)) {
        return 'image/gif';
    } else if (filename.endsWith(EXTENSION_WEBP)) {
        return 'image/webp';
    } else {
        throw new Error('Image type not supported');
    }
};

export const doUpload = async (
    arweave: Arweave,
    data: Buffer | string,
    fileType: string,
    jwk: JWKInterface,
    isUploadByChunk = false,
) => {
    const tx = await arweave.createTransaction({ data }, jwk);
    tx.addTag('Content-Type', fileType);
    await arweave.transactions.sign(tx, jwk);
    if (isUploadByChunk) {
        const uploader = await arweave.transactions.getUploader(tx);
        while (!uploader.isComplete) {
            await uploader.uploadChunk();
            console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
        }
    }
    await arweave.transactions.post(tx);
    return tx;
};