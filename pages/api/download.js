// NOT USED BECAUSE IT DOES NOT WORK IN AWS AMPLIFY, INSTEAD THIS API ENDPOINT IS ON THE EC2 INSTANCE

import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
const archiver = require("archiver");

const s3Client = new S3Client({
  region: process.env.S3_DOWNLOAD_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

async function listObjects(uploadPackageId) {
  try {
    const objectKeys = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.S3_DOWNLOAD_BUCKET_NAME,
        Prefix: uploadPackageId,
      })
    );
    if (objectKeys && objectKeys.Contents) {
      return objectKeys.Contents.map((o) => o.Key);
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error listando los objetos de S3", error);
  }
}

async function prepareZipForDownload(uploadPackageId, objectKeys, res) {
  return new Promise(async (resolve, reject) => {
    // Here we tell the client browser that It has to download the response
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${uploadPackageId}.zip`
    );
    const archive = archiver("zip");
    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(res);

    for (let objectKey of objectKeys) {
      let getObjectResponse;
      try {
        getObjectResponse = await s3Client.send(
          new GetObjectCommand({
            Bucket: process.env.S3_DOWNLOAD_BUCKET_NAME,
            Key: objectKey,
          })
        );
        const fileName = objectKey.split("/").pop();
        archive.append(getObjectResponse.Body, { name: fileName });
      } catch (error) {
        console.error("Error obteniendo el objeto de aws s3", error);
        reject(error);
      }
    }

    archive.finalize();
    archive.on("end", () => {
      resolve();
    });
  });
}

export default async function handler(req, res) {
  try {
    const { uploadPackageId } = req.body;
    const objectKeys = await listObjects(uploadPackageId);
    if (objectKeys.length) {
      await prepareZipForDownload(uploadPackageId, objectKeys, res);
    } else {
      res.status(404).json({ error: "id del paquete de subida no encontrado" });
    }
  } catch (error) {
    res.status(500).json({
      error: "Ocurrio un error preparando el comprimido para descargar.",
    });
  }
}
