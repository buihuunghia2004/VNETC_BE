import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/usr/src/app/build/uploads/'); // Thư mục để lưu file
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Đổi tên file để tránh trùng lặp
    }
})
// Bộ lọc để chỉ chấp nhận file PDF
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Chấp nhận file
    } else {
        cb(new Error('Only PDF files are allowed!'), false); // Từ chối file không phải PDF
    }
};
export const multerUpload = multer({
    storage: storage,
    // fileFilter: fileFilter
});
