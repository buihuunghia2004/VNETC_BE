import express from "express";
import isAuth from "~/middlewares/authMiddleware";
import {multerUpload} from "~/middlewares/multerPDFhandle";
import {
    addDocument,
    getDocument,
    getDocumentById,
    updateDocument,
    deleteDocument
} from "~/modules/Documents/documentController";
import {upload} from "~/middlewares/multipleUploadMiddleware";

const Document = express.Router();

Document.route('/')
    .post(multerUpload.array('file'), addDocument) // Thêm tài liệu
    .get(getDocument); // Lấy danh sách tài liệu

Document.route('/:id')
    .patch(isAuth, multerUpload.array('file'), updateDocument)
    .get(getDocumentById) // Lấy tài liệu theo ID
    .delete(isAuth, deleteDocument); // Xóa tài liệu theo ID

export const documentRoute = Document;
