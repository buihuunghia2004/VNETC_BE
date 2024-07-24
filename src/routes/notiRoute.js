import express, {Router} from "express";
import isAuth from "~/middlewares/authMiddleware";
import {
    addNotification,
    deleteNotiById,
    getNotiById,
    getNotification
} from "~/modules/Notification/NotificationController";

const Notification = express.Router()

Notification.post("/", addNotification)
Notification.get("/", getNotification)
Notification.get("/:id", getNotiById)
Notification.delete("/:id", deleteNotiById)
export const notiRoute = Notification