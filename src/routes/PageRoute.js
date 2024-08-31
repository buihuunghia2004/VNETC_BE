import { Router } from "express"
import isAuth from "~/middlewares/authMiddleware"
import { upload } from "~/middlewares/multipleUploadMiddleware"
import {
  addPage,
  deletePage,
  getBySlug,
  getPage,
  updatePage,
} from "~/modules/Page/pageController"
import { multerUpload } from "~/middlewares/multerPDFhandle"

const Page = Router()
Page.post("/", isAuth, multerUpload.single("file"), addPage)
Page.get("/", getPage)
Page.patch("/:slug", isAuth, isAuth, multerUpload.single("file"), updatePage)
Page.get("/:slug", getBySlug)
Page.delete("/:slug", isAuth, deletePage)
export const PageRoute = Page
