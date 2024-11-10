const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");

const s3Client = new S3Client({
  region: "",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
});

const PROJECT_ID = process.env.PROJECT_ID;

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
    console.log("Build completed successfully!!!!!");
    const distFolderPath = path.join(__dirname, "output", "dist");
    const distFolderContent = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    for (const filePath of distFolderContent) {
      if (fs.lstatSync(filePath).isDirectory()) continue;

      const command = PutObjectCommand({
        Bucket: "",
        key: `__outputs/${PROJECT_ID}/${filePath}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath),
      });

      await s3Client.send(command);
    }

    console.log("done !!!!!");
  });
}
