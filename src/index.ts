import express from "express";
//import * as express from "express";
import pinataSDK from "@pinata/sdk";
import fs from "fs";
import { TezosToolkit } from "@taquito/taquito";
import { bytes2Char } from "@taquito/utils";

const PinataKeys = require("./PinataKeys");
const mintNFT = require("./fund-nft/src/index.js");
const cors = require("cors");
const multer = require("multer");
const ipfsHost = "https://ipfs.io/ipfs/";
const Tezos =  new TezosToolkit("https://testnet-tezos.giganode.io/");

const app = express();
const port = 8080;
const corsOptions = {
    origin: [
        "http://localhost:8080"
    ],
    optionSuccessStatus: 200
};

/*const getUserNtfs = async (address: string) => {
    const contract = await Tezos.wallet.at(contractAddress);
    nftStorage = await contract.storage();
    const getTokenIds = await nftStorage.reverse_ledger.get(address);
    if (getTokenIds) {
        userNfts = await Promise.all([
            getTokenIds.map(async id => {
                const tokenId = id.toNumber();
                const metadata = await nftStorage.token_metadata.get(tokenId);
                const tokenInfoBytes = metadata.token_info.get("");
                const tokenInfo = bytes2Char(tokenInfoBytes);
                return {
                    tokenId,
                    ipfsHash:
                        tokenInfo.slice(0, 7) === "ipfs://" ? tokenInfo.slice(7) : null
                };
            })
        ]);
    }
};*/

const upload = multer({ dest: "uploads/" });
let pinata = pinataSDK(PinataKeys.apiKey, PinataKeys.apiSecret);

app.use(cors(corsOptions));
app.use(express.json({limit: "50mb"}));
app.use(
    express.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000
    })
);

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});

app.post("/mint", upload.single("image"), async (req, res) => {
    const multerReq = req as any;

    if (!multerReq.file) {
        res.status(500).json({ status: false, msg: "no file provided" });
    } else {
        const fileName = multerReq.file.filename;
        console.log(fileName);
        console.log(PinataKeys.apiKey);
        console.log(PinataKeys.apiSecret);
        await pinata
            .testAuthentication()
            .catch((err: any) => res.status(500).json(JSON.stringify(err)));
        const readableStreamForFile = fs.createReadStream(`./uploads/${fileName}`);
        console.log(req.body);
        const options: any = {
            pinataMetadata: {
                name: req.body.title.replace(/\s/g, "-"),
                keyvalues: {
                    description: req.body.description
                }
            }
        };
        console.log(options);
        const pinnedFile = await pinata.pinFileToIPFS(
            readableStreamForFile,
            options,
        );
        if (pinnedFile.IpfsHash && pinnedFile.PinSize > 0 ) {
            fs.unlinkSync(`./uploads/${fileName}`);
            const metadata = {
                name: req.body.title,
                description: req.body.description,
                symbol: "TUT",
                artifactUri: `ipfs://${pinnedFile.IpfsHash}`,
                displayUri: `ipfs://${pinnedFile.IpfsHash}`,
                creators: [req.body.creator],
                decimals: 0,
                thumbnailUri: "https://tezostaquito.io/img/favicon.png",
                is_transferable: true,
                shouldPreferSymbol: false
            };

            const pinnedMetadata = await pinata.pinJSONToIPFS(metadata, {
                pinataMetadata: {
                    name: "TUT-metadata"
                }
            });

            if (pinnedMetadata.IpfsHash && pinnedMetadata.PinSize > 0) {
                let ipfsUrl = ipfsHost + pinnedFile.IpfsHash;
                let owner = req.body.owner;
                mintNFT(owner,ipfsUrl);
                res.status(200).json({
                    status: true,
                    msg: {
                        imageHash: pinnedFile.IpfsHash,
                        metadataHash: pinnedMetadata.IpfsHash
                    }
                });
            }

        }
    }
});