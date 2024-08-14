import {Project} from "~/models/projectModel";
import {ServiceDetailModel} from "~/models/serviceDetailModel";
import ApiErr from "~/utils/ApiError";
import {StatusCodes} from "http-status-codes";
import uploadSingleImageToCloudinary from "~/utils/uploadSingleImage";
import {projectDetail} from "~/models/ProjectDetailModel";

class ProjectService {
    async addProject(data, file, account) {
        try {
            const uploadedImage = await uploadSingleImageToCloudinary(file.path);
            const project = new Project({
                ...data,
                image: uploadedImage.secure_url,
                createdBy: account.username
            });
            let savedProject;
            try {
                savedProject = await project.save();
            } catch (projectError) {
                throw new ApiErr(StatusCodes.BAD_REQUEST, `Failed to save project: ${projectError.message}`);
            }
            const newProjectDetail = new projectDetail({
                projectId: savedProject._id,
                content: data.content,
                createdBy: account.username
            });
            let savedProjectDetail;
            try {
                savedProjectDetail = await newProjectDetail.save();
            } catch (detailError) {
                await Project.findByIdAndDelete(savedProject._id);
                throw new ApiErr(StatusCodes.BAD_REQUEST, `Failed to save project detail: ${detailError.message}`);
            }
            return [savedProject, savedProjectDetail];
        } catch (e) {
            if (e instanceof ApiErr) {
                throw e;
            }
            throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, `Add project failed: ${e.message}`);
        }
    }

    async getProject({page, limit, type}) {
        try {
            const query = type ? {projectType: type} : {};
            return await Project.find(query).skip(limit * (page - 1)).limit(limit).sort({createdAt: -1})
        } catch (e) {
            throw e
        }
    }

    async deleteProject(projectId) {
        try {
            const result = await Promise.all([
                projectDetail.deleteMany({projectId}),
                Project.findByIdAndDelete(projectId),
            ]);
            if (!result) throw new ApiErr(StatusCodes.BAD_REQUEST, `Failed to save project detail: ${result.message}`);
            return result;
        } catch (e) {
            throw e;
        }
    }


    async updateProject(projectId, data, file, account) {
        try {
            // Handle file upload if present
            let imageUrl;
            if (file) {
                const uploadedImage = await uploadSingleImageToCloudinary(file.path);
                imageUrl = uploadedImage.secure_url;
            }

            // Add image URL to data if available
            if (imageUrl) {
                data.image = imageUrl;
            }
            // Update the project
            const project = await Project.findByIdAndUpdate(
                projectId,
                {$set: data, updatedBy: account.username},
                {new: true, runValidators: true}
            );

            if (!project) {
                throw new Error('Cannot find project');
            }

            // Update project details
            const projectDetailUpdateData = {
                content: data.content,
                updatedBy: account.username,
            };

            const updatedProjectDetail = await projectDetail.findOneAndUpdate(
                {projectId: project._id},
                {$set: projectDetailUpdateData},
                {new: true, upsert: true, runValidators: true}
            );

            return [project, updatedProjectDetail];
        } catch (e) {
            throw new Error(`Update failed: ${e.message}`);
        }
    }


    async getProjectById(projectId) {
        try {
            const project = await
                Project.findByIdAndUpdate(
                    {_id: projectId},
                    {$inc: {views: 1}},
                    {new: true, lean: true});
            if (!project) {
                throw new ApiErr(StatusCodes.BAD_REQUEST, "Service detail not found");
            }

            const projectDetails = await projectDetail.findOne({projectId: projectId});
            if (!projectDetails) {
                throw new ApiErr(StatusCodes.BAD_REQUEST, "Project details not found");
            }
            const data = {
                // _id: project._id,
                name: project.name,
                views: project.views,
                summary: project.summary,
                image: project.image,
                projectType: project.projectType,
                createdBy: project.createdBy,
                updatedBy: project.updatedBy,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                content: projectDetails.content // Ensure content is included
            };
            return data;
        } catch (e) {
            throw e;
        }
    }


    async getByTopViews() {
        try {
            const data = await Project.find()
                .limit(8)
                .sort({views: -1});
            return data
        } catch (e) {
            throw e
        }
    }

    //
    // async getFeatured() {
    //     try {
    //         return await ServiceModel.find({isFeatured: true}).limit(5).sort({createdAt: -1})
    //     } catch (e) {
    //         throw e
    //     }
    // }
    async searchProjects(searchTerm, page, limit) {
        try {

            const skip = (page - 1) * limit;
            const searchQuery = {
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { summary: { $regex: searchTerm, $options: 'i' } }
                ]
            };
            const [projects, totalCount] = await Promise.all([
                Project.find(searchQuery)
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .lean(),
                Project.countDocuments(searchQuery)
            ]);
            console.log("project", projects)
            const projectIds = projects.map(item => item._id);
            const projectDetails = await projectDetail.find({ projectId: { $in: projectIds } }).lean();

            const fullProjectResults = projects.map(project => ({
                ...project,
                content: projectDetails.find(detail => detail.projectId.toString() === project._id.toString())?.content || null
            }));

            return {
                results: fullProjectResults,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            };
        } catch (error) {
            console.error("Error searching projects:", error);
            throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, "Error searching projects");
        }
    }
}


const projectService = new ProjectService()

export default projectService