// import util from 'util'
// import path from "path";
import multer from "multer"

// // Khởi tạo biến cấu hình cho việc lưu trữ file upload
// let storage = multer.diskStorage({
//   // Định nghĩa nơi file upload sẽ được lưu lại
//   destination: (req, file, callback) => {
//     callback(null, path.join(`${__dirname}/../uploadResults`));
//   },
//   filename: (req, file, callback) => {
//     // ở đây các bạn có thể làm bất kỳ điều gì với cái file nhé.
//     // Mình ví dụ chỉ cho phép tải lên các loại ảnh png & jpg
//     let math = ["image/png", "image/jpeg"]
//     if (math.indexOf(file.mimetype) === -1) {
//       let errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpeg or png.`;
//       return callback(errorMess, null);
//     }

//     // Tên của file thì mình nối thêm một cái nhãn thời gian để tránh bị trùng tên file.
//     let filename = `${Date.now()}-${file.originalname}`;
//     callback(null, filename);
//   }
// });

// // Khởi tạo middleware uploadManyFiles với cấu hình như ở trên,
// // Bên trong hàm .array() truyền vào name của thẻ input, ở đây mình đặt là "many-files", và tham số thứ hai là giới hạn số file được phép upload mỗi lần, mình sẽ để là 17 (con số mà mình yêu thích). Các bạn thích để bao nhiêu cũng được.
// let uploadManyFiles = multer({
//   storage: storage,
// })
// // .array("many-files", 1);

// // Mục đích của util.promisify() là để bên controller có thể dùng async-await để gọi tới middleware này
// export let multipleUploadMiddleware = util.promisify(uploadManyFiles);

const storage = multer.diskStorage({
  // destination:(res,file,callback)=>{
  //   callback(null,'upload')
  // },
  filename:(res,file,callback)=>{
    callback(null,Date.now()+'.png')
  }
})

export const upload = multer({storage:storage})