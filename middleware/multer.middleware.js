import multer from "multer";
import path from "path";
// export const upload = multer({ dest: "uploads/" });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extention = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extention);
  },
});

export const upload = multer({ storage: storage });
