import multer from "multer";
import {v4 as uuid} from "uuid";
import fs from "fs";
import path from "path";

// Ensure uploads directory exists
const uploadsDir = "uploads";
const videosDir = path.join(uploadsDir, "videos");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req,file,cb){
        cb(null, uploadsDir)
    },
    filename(req,file,cb){
         const id = uuid()

         const extensionName = file.originalname.split(".").pop();
         const filename = `${id}.${extensionName}`;

         cb(null, filename);
         
    } 
})

const videoStorage = multer.diskStorage({
    destination(req,file,cb){
        cb(null, videosDir)
    },
    filename(req,file,cb){
         const id = uuid()

         const extensionName = file.originalname.split(".").pop();
         const filename = `${id}.${extensionName}`;

         cb(null, filename);
         
    } 
})

// no explicit fileSize limits; multer will allow any size (bounded only by environment/proxy)
const upload = multer({
    storage
});

// videos can also be arbitrarily large; external proxies may still enforce limits
const videoUpload = multer({
    storage: videoStorage
});

export const uploadFiles = upload.single('file');
export const uploadVideoFile = videoUpload.single('videoFile');