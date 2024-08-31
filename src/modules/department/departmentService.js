import {StatusCodes} from "http-status-codes";
import {Member} from "~/models/memberModel";
import {Category} from "~/models/categoryModel";
import {accountService} from "~/modules/account/accountService";
import {News} from "~/models/newsModel";
import ApiErr from "~/utils/ApiError";
import {ServiceModel} from "~/models/serviceModel";
import {ParentNav} from "~/models/navigationModel";

const {Department} = require("~/models/departentModel")
const uploadSingleImageToCloudinary = require("~/utils/uploadSingleImage")
const create = async (data, creator) => {
    const department = new Department(data)
    department.createdBy = creator
    await department.save()
    return department
}

const getAll = async () => {
    const departments = await Department.find()
    return departments
}
const createMember = async (id, data, file, creator) => {
    try {
        if (!file) throw new ApiErr(StatusCodes.BAD_REQUEST, 'Cannot find Image')
        const checkDepartmet = await Department.exists({_id: id})
        if (!checkDepartmet) throw new ApiErr(StatusCodes.BAD_REQUEST, 'Cannot Find Department')
        const uploadImage = await uploadSingleImageToCloudinary(file.path)
        if (!uploadImage) throw new ApiErr(StatusCodes.BAD_REQUEST, 'Cannot Upload Image')

        const member = new Member(data)
        member.image = uploadImage.secure_url
        member.departmentId = id
        member.createdBy = creator

        await member.save()
        return member
    } catch (e) {
        throw e
    }
}
const deleteDepartment = async (id) => {
    try {
        const result = await Promise.all([
            Department.findOneAndDelete({_id: id}),
            Member.deleteMany({departmentId: id})
        ]);
        if (!result) throw new ApiErr(StatusCodes.BAD_REQUEST, 'Cannot find Department and Member')
        return result
    } catch (e) {
        throw e
    }
}
const updateDepartment = async (id, data, creator) => {
    try {
        if (!data) throw new ApiErr(StatusCodes.BAD_REQUEST, 'Please Check The Value')
        const department = await Department.findByIdAndUpdate(id, {name: data.name, updatedBy: creator})
        if (!department) throw new ApiErr(StatusCodes.BAD_REQUEST, 'Cannot Find Department')
        return department
    } catch (e) {
        throw e
    }
}
const getMember = async (id, pagi) => {
    try {
        const {page, limit} = pagi
        const checkDepartmet = await Department.exists({_id: id})
        if (!checkDepartmet) throw new ApiErr(StatusCodes.BAD_REQUEST, 'Cannot Find Department')
        const result = await Member.find({departmentId: id}).skip(limit * (page - 1)).limit(limit).sort({createdAt: -1})
        return result
    } catch (e) {
        throw e
    }
}

const updatedMember = async (id, data, file) => {
    try {
        if (!data) throw new ApiErr(StatusCodes.BAD_REQUEST, 'Please Check The Value')
        // Xử lý việc upload file nếu có
        let imageUrl;
        if (file) {
            const uploadedImage = await uploadSingleImageToCloudinary(file.path);
            imageUrl = uploadedImage.secure_url;
        }
        if (imageUrl) {
            data.image = imageUrl;
        }
        const result = await Member.findByIdAndUpdate(
            id,
            {$set: data},
            {new: true, runValidators: true}
        );
        return result
    } catch (e) {
        throw e
    }
}
const deleteMember = async (id) => {
    try {
        const memberExists = await Member.exists({_id: id})
        if (!memberExists) throw new ApiErr(StatusCodes.BAD_REQUEST, 'Cant find Member')
        const result = await Member.findByIdAndDelete(id)
        return result
    } catch (e) {
        throw e
    }
}

const getMemberById = async (id) => {
    try {

        const result = await Member.findById(id)
        if (!result) throw new ApiErr(StatusCodes.BAD_REQUEST, 'Cant find Member')
        return result
    } catch (e) {
        throw e
    }
}
export const departmentService = {
    create,
    getAll,
    createMember,
    deleteDepartment,
    updateDepartment,
    getMember,
    updatedMember,
    deleteMember,
    getMemberById
}