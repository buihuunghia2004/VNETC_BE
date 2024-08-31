import ApiErr from "~/utils/ApiError"
import { StatusCodes } from "http-status-codes"
import { DocumentModel } from "~/models/documentModel"
import fs from "fs"
import { promisify } from "util"
import * as path from "node:path"

const unlinkAsync = promisify(fs.unlink)

class DocService {
  async addDoc(data, files) {
    const attachments = files.map((file) => {
      let fileType

      if (file.mimetype === "application/pdf") {
        fileType = "pdf"
      } else if (file.mimetype.startsWith("image/")) {
        fileType = "img"
      } else {
        fileType = "other"
      }

      return {
        filename: file.originalname,
        file_type: fileType,
        file_url: file.path,
      }
    })

    const doc = new DocumentModel({
      ...data,
      createdBy: "admin",
      attachments,
    })

    await doc.save()
    return doc
  }

  async getDoc(query) {
    const { page, limit, type } = query
    const filter = {}

    if (type) {
      filter.type = type
    }

    const docs = await DocumentModel.find(filter)
      .skip(limit * (page - 1))
      .limit(limit)
      .sort({ createdAt: -1 })

    return docs
  }

  async getDocById(id) {
    const doc = await DocumentModel.findById(id)
    if (!doc) {
      throw new ApiErr(StatusCodes.NOT_FOUND, "Document not found")
    }
    return doc
  }

  async updateDoc(id, data, files) {
    const doc = await DocumentModel.findById(id)
    if (!doc) {
      throw new ApiErr(StatusCodes.NOT_FOUND, "Document not found")
    }

    Object.assign(doc, data)

    if (files && files.length > 0) {
      // Xóa các tệp cũ cùng loại trước khi thêm tệp mới
      const fileTypesToDelete = new Set(
        files.map((file) => this.getFileType(file.mimetype))
      )

      for (const fileType of fileTypesToDelete) {
        await this.deleteAttachmentsByType(doc, fileType)
      }

      // Thêm các tệp mới
      for (const file of files) {
        const fileType = this.getFileType(file.mimetype)
        const newAttachment = {
          filename: file.originalname,
          file_type: fileType,
          file_url: file.path,
        }

        doc.attachments = doc.attachments.filter(
          (attachment) => attachment.file_type !== fileType
        )
        doc.attachments.push(newAttachment)
      }
    }

    doc.updatedBy = "admin"
    await doc.save()
    return doc
  }

  async deleteDoc(id) {
    const doc = await DocumentModel.findByIdAndDelete(id)
    if (!doc) {
      throw new ApiErr(StatusCodes.NOT_FOUND, "Document not found")
    }

    // Xóa tất cả các file đính kèm
    await Promise.all(
      doc.attachments.map(async (attachment) => {
        try {
          await unlinkAsync(
            path.join(__dirname, "..", "..", "..", attachment.file_url)
          )
        } catch (err) {
          console.error(`Failed to delete file: ${attachment.file_url}`, err)
        }
      })
    )

    return { message: "Document and attached files deleted successfully" }
  }

  getFileType(mimetype) {
    if (mimetype === "application/pdf") return "pdf"
    if (mimetype.startsWith("image/")) return "img"
    return "other"
  }

  async deleteAttachmentsByType(doc, fileType) {
    const attachmentsToDelete = doc.attachments.filter(
      (attachment) => attachment.file_type === fileType
    )

    for (const attachment of attachmentsToDelete) {
      try {
        await unlinkAsync(
          path.join(__dirname, "..", "..", "..", attachment.file_url)
        )
      } catch (err) {
        console.error(`Failed to delete old file: ${attachment.file_url}`, err)
      }
    }
  }
}

const documentService = new DocService()
export default documentService
