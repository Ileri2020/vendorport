import multer from "multer";

const filter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/webp"){
        cb(null, true)
    }
    // else(
    //     {"error" : "Unsupported file format. Upload only jpeg, jpg or webp"},
    //     false
    // )
}

const memstorage = multer.memoryStorage()

export const uploadimg = multer({ storage: memstorage, limits: {fieldSize: 1024 * 5012}, fileFilter: filter })
