import {SuccessRes} from "~/utils/SuccessRes";
import documentService from "~/modules/Documents/documentService";

export const addDocument = async (req, res, next) => {
    try {
        const {body: data, files} = req;
        const result = await documentService.addDoc(data, files);
        SuccessRes(res, result, 'Add Document Success');
    } catch (error) {
        next(error);
    }
};

export const getDocument = async (req, res, next) => {
    try {
        const result = await documentService.getDoc(req.query);
        SuccessRes(res, result, 'Get Documents Success');
    } catch (error) {
        next(error);
    }
};

export const getDocumentById = async (req, res, next) => {
    try {
        const {id} = req.params;
        const result = await documentService.getDocById(id);
        SuccessRes(res, result, 'Get Document by ID Success');
    } catch (error) {
        next(error);
    }
};

export const updateDocument = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {body: data, files} = req;
        const result = await documentService.updateDoc(id, data, files);
        SuccessRes(res, result, 'Update Document Success');
    } catch (error) {
        next(error);
    }
};

export const deleteDocument = async (req, res, next) => {
    try {
        const {id} = req.params;
        const result = await documentService.deleteDoc(id);
        SuccessRes(res, result, 'Delete Document Success');
    } catch (error) {
        next(error);
    }
};
