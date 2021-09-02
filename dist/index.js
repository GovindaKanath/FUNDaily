"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//import * as express from "express";
const sdk_1 = __importDefault(require("@pinata/sdk"));
const fs_1 = __importDefault(require("fs"));
const taquito_1 = require("@taquito/taquito");
const PinataKeys = require("./PinataKeys");
const Fundaily = require("./fund-nft/src/index.js");
const cors = require("cors");
const multer = require("multer");
const ipfsHost = "https://ipfs.io/ipfs/";
const Tezos = new taquito_1.TezosToolkit("https://testnet-tezos.giganode.io/");
const app = express_1.default();
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
let pinata = sdk_1.default(PinataKeys.apiKey, PinataKeys.apiSecret);
app.use(cors(corsOptions));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000
}));
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
app.post("/mint", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const multerReq = req;
    if (!multerReq.file) {
        res.status(500).json({ status: false, msg: "no file provided" });
    }
    else {
        const fileName = multerReq.file.filename;
        console.log(fileName);
        console.log(PinataKeys.apiKey);
        console.log(PinataKeys.apiSecret);
        yield pinata
            .testAuthentication()
            .catch((err) => res.status(500).json(JSON.stringify(err)));
        const readableStreamForFile = fs_1.default.createReadStream(`./uploads/${fileName}`);
        console.log(req.body);
        const options = {
            pinataMetadata: {
                name: req.body.title.replace(/\s/g, "-"),
                keyvalues: {
                    description: req.body.description
                }
            }
        };
        console.log(options);
        const pinnedFile = yield pinata.pinFileToIPFS(readableStreamForFile, options);
        if (pinnedFile.IpfsHash && pinnedFile.PinSize > 0) {
            fs_1.default.unlinkSync(`./uploads/${fileName}`);
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
            const pinnedMetadata = yield pinata.pinJSONToIPFS(metadata, {
                pinataMetadata: {
                    name: "TUT-metadata"
                }
            });
            if (pinnedMetadata.IpfsHash && pinnedMetadata.PinSize > 0) {
                let ipfsUrl = ipfsHost + pinnedFile.IpfsHash;
                let owner = req.body.owner;
                Fundaily.mintNFT(owner, ipfsUrl)
                    .then(data => {
                        console.log(data);
                        res.status(200).json({
                            status: true,
                            msg: {
                                imageHash: pinnedFile.IpfsHash,
                                metadataHash: pinnedMetadata.IpfsHash
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        }
    }
}));
//# sourceMappingURL=index.js.map