import {Router} from "express";
import isAuth from "~/middlewares/authMiddleware";
import {upload} from "~/middlewares/multipleUploadMiddleware";
import {addVideo, deleteViddeo, getVideo} from "~/modules/Video/videoController";

const Video = Router();
Video.post("/", isAuth, addVideo)
Video.get("/", getVideo)
Video.delete("/:id", isAuth, deleteViddeo)
export const VideoLibraryRoute = Video;