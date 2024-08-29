import ApiErr from "~/utils/ApiError";
import {StatusCodes} from "http-status-codes";
import {DocumentModel} from "~/models/documentModel";
import fs from 'fs';
import {promisify} from 'util';

const unlinkAsync = promisify(fs.unlink)

class docService {
    async addDoc(data, files) {
        const attachments = files.map(file => {
            let fileType;
            if (file.mimetype === 'application/pdf') {
                fileType = 'pdf';
            } else if (file.mimetype.startsWith('image/')) {
                fileType = 'img';
            } else {
                fileType = 'other';
            }

            return {
                filename: file.originalname,
                file_type: fileType,
                file_url: file.path
            };
        });


        const doc = new DocumentModel({
            ...data,
            createdBy: 'admin',
            attachments: attachments
        });

        await doc.save();
        return doc;
    }

    async getDoc(data) {
        const {page, limit, type} = data;
        const query = {};

        if (type) {
            query.type = type;
        }

        const docs = await DocumentModel.find(query)
            .skip(limit * (page - 1))
            .limit(limit)
            .sort({createdAt: -1});

        return docs;
    }


    async getDocById(id) {
        const doc = await DocumentModel.findById(id);
        if (!doc) {
            throw new ApiErr(StatusCodes.NOT_FOUND, "Document not found");
        }
        return doc;
    }

    async updateDoc(id, data, files) {
        const doc = await DocumentModel.findById(id);
        if (!doc) {
            throw new ApiErr(StatusCodes.NOT_FOUND, "Document not found");
        }

        Object.assign(doc, data);

        if (files && files.length > 0) {
            const updatedAttachmentsMap = new Map();

            await Promise.all(
                files.map(async (file) => {
                    let fileType;
                    if (file.mimetype === 'application/pdf') {
                        fileType = 'pdf';
                    } else if (file.mimetype.startsWith('image/')) {
                        fileType = 'img';
                    } else {
                        fileType = 'other';
                    }

                    const attachment = {
                        filename: file.originalname,
                        file_type: fileType,
                        file_url: file.path,
                    };

                    const existingAttachment = doc.attachments.find((a) =>
                        a.file_type === fileType && a.filename === attachment.filename
                    );

                    if (existingAttachment) {
                        Object.assign(existingAttachment, attachment);
                    } else {
                        doc.attachments.push(attachment);
                    }

                    updatedAttachmentsMap.set(`${fileType}:${attachment.filename}`, attachment);
                })
            );

            doc.attachments = doc.attachments.filter((attachment) =>
                updatedAttachmentsMap.has(`${attachment.file_type}:${attachment.filename}`)
            ).map((attachment) => updatedAttachmentsMap.get(`${attachment.file_type}:${attachment.filename}`));
        }

        doc.updatedBy = 'admin';
        await doc.save();
        return doc;
    }

    async deleteDoc(id) {
        const doc = await DocumentModel.findByIdAndDelete(id);

        if (!doc) {
            throw new ApiErr(StatusCodes.NOT_FOUND, "Document not found");
        }

        // Xóa tất cả các file đính kèm
        const deleteFilesPromises = doc.attachments.map(async (attachment) => {
            try {
                await unlinkAsync(attachment.file_url);
            } catch (err) {
                console.error(`Failed to delete file: ${attachment.file_url}`, err);
            }
        });

        await Promise.all(deleteFilesPromises);

        return {message: "Document and attached files deleted successfully"};
    }
}

const documentService = new docService();

export default documentService;
