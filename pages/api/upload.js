import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuidv4 } from "uuid";
import { S3Client } from "@aws-sdk/client-s3";

// This API Route uploads photos to aws s3, there is a lambda function that then erases the photo from the upload bucket, so don't look for the uploaded picture there, instead, look for the uploaded pictures in the download bucket

export const config = {
  api: {
    responseLimit: false,
    bodyParser: false,
  },
};

const s3Client = new S3Client({
  region: process.env.S3_UPLOAD_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

function generateFileName(
  eventNumber,
  photographerName,
  uploadPackageId,
  photoName
) {
  return `${uploadPackageId}/${eventNumber}/${photographerName}/${photoName}`;
}

const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5, // limit file size to 5 MB
  },
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_UPLOAD_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      if (!file.originalname.endsWith(".jpg")) {
        const error = new Error("El archivo debe ser una imagen JPG");
        error.statusCode = 400;
        cb(error);
        return;
      }
      cb(
        null,
        generateFileName(
          req.body.eventNumber,
          req.body.photographerName,
          req.uploadPackageId,
          file.originalname
        )
      );
    },
  }),
}).array("images");

export default async function handler(req, res) {
  // Generate code for download
  if (req.method === "POST") {
    req.uploadPackageId = uuidv4();
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    res.status(200).json({ uploadPackageId: req.uploadPackageId });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
