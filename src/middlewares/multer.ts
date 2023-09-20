import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const fieldname = file.fieldname;
    let folder;
    if (fieldname === "idCard") {
      folder = "uploads/IDs";
    } else if (fieldname === "businessImage") {
      folder = "uploads/businessImages";
    } else if (fieldname === "products") {
      folder = "uploads/products";
    } else {
      folder = "uploads/others";
    }
    callback(null, folder);
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({
  storage,
});
