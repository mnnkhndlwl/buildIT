const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
require("dotenv").config();

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
});

const PROJECT_ID = process.env.PROJECT_ID;
console.log(
  "🚀 ~ PROJECT_ID:",
  PROJECT_ID,
  "::::",
  process.env.AWS_S3_ACCESS_KEY
);

async function init() {
  console.log("executing script.js.....");
  const outDirPath = path.join(__dirname, "output");
  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  p.stdout.on("data", function (data) {
    console.log("🚀 ~ p.stdout.on ~ data:", data.toString());
  });

  p.stdout.on("error", function (data) {
    console.log("🚀 ~ p.stdout.on ~ Error:", data.toString());
  });

  p.on("close", async function () {
    console.log("Build Complete");

    const distFolderPath = path.join(__dirname, "output", "dist");
    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    for (const file of distFolderContents) {
      const filePath = path.join(distFolderPath, file);
      if (fs.lstatSync(filePath).isDirectory()) continue;

      console.log("uploading", filePath);

      const command = new PutObjectCommand({
        Bucket: "buildit-outputs",
        Key: `__outputs/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath),
      });

      await s3Client.send(command);

      console.log("uploaded", filePath);
    }

    console.log("Done...");
  });
}

init();
