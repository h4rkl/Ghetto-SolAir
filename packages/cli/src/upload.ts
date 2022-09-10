import { readFile } from "fs/promises";
import Arweave from 'arweave';

const main = async (key: string) => {

        const arweave = Arweave.init({
            host: 'arweave.net',
            port: 443,
            protocol: 'https',
            timeout: 20000,
            logging: false,
        });        
        const jwkkey = await readFile(key, "utf8");
        const jwk = JSON.parse(jwkkey);   
        // arweave.wallets.jwkToAddress(jwk).then((address) => {
        //     console.log('-------------', address);
        // }); 
        const akey = await arweave.wallets.generate();
        console.log(akey);
        const address = await arweave.wallets.jwkToAddress(akey);
        console.log(address);
}

main('$HARKL');