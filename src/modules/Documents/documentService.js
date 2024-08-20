import ApiErr from "~/utils/ApiError";
import {StatusCodes} from "http-status-codes";
import {DocumentModel} from "~/models/documentModel";

class docService {
    async addDoc(data, file) {
        const doc = new DocumentModel(data);
        doc.createdBy = 'admin';
        doc.attachments = file.path;
        await doc.save();
        return doc;
    }

    async getDoc(data) {
        const {page, limit, category_id} = data;
        const query = category_id ? {category_id} : {};
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

    async updateDoc(id, data, file) {
        const doc = await DocumentModel.findById(id);
        if (!doc) {
            throw new Error('Document not found');
        }

        Object.assign(doc, data);

        if (file) {
            doc.attachments = file.path;
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
        return {message: "Document deleted successfully"};
    }
}

const documentService = new docService();

export default documentService;
