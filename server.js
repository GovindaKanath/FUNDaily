import express from "express";
import pinataSDK from "@pinata/sdk";
import fs from "fs";
const PinataKeys = require("./PinataKeys");
const cors = require("cors");
const multer = require("multer");

const app = express();
const port = 8080;
const corsOptions = {
    origin: [
        "http://localhost:8080"
    ],
    optionSuccessStatus: 200
};
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
    }
});