import {Router} from "express";
import isAuth from "~/middlewares/authMiddleware";
import {upload} from "~/middlewares/multipleUploadMiddleware";
import {
    addProject,
    deleteProject, getByTopViews,
    getProject,
    getProjectById, search,
    updateProject
} from "~/modules/project/projectController";
import {newsController} from "~/modules/news/newsController";

const Project = Router();

Project.post("/",isAuth, upload.single("image"), addProject);
Project.get("/", getProject)
Project.get("/search", search)
Project.get("/:id", getProjectById)
Project.patch("/:id",isAuth, upload.single("image"), updateProject)
Project.delete("/:id",isAuth, deleteProject)
Project.get("/views", getByTopViews)

// Router.route('/search').get(newsController.search)
export const ProjectRoute = Project;
