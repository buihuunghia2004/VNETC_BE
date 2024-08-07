import {Router} from "express";
import isAuth from "~/middlewares/authMiddleware";
import {upload} from "~/middlewares/multipleUploadMiddleware";
import {addPage, deletePage, getBySlug, getPage, updatePage} from "~/modules/Page/pageController";

const Page = Router();
Page.post("/", isAuth, addPage)
Page.get("/", getPage)
Page.patch("/:slug", isAuth, updatePage)
Page.get("/:slug",getBySlug)
Page.delete("/:slug", isAuth, deletePage)
export const PageRoute = Page;