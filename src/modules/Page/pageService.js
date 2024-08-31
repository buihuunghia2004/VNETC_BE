import ApiErr from "~/utils/ApiError"
import { StatusCodes } from "http-status-codes"
import { PageModel } from "~/models/PageModel"
import slugify from "~/utils/stringToSlug"
import * as fs from "node:fs"
import * as path from "node:path"

function isValidUrl(input) {
  try {
    new URL(input)
    return true
  } catch (err) {
    return false
  }
}

class Page {
  async addPageService(data, account, file) {
    const slug = slugify(data.name)

    const result = new PageModel({
      ...data,
      slug: slug,
      createdBy: account.username,
      attachments: file ? file.path : "",
    })

    try {
      await result.save()
      return result
    } catch (error) {
      throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to add page")
    }
  }

  async getPages(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit
      const pages = await PageModel.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })

      const total = await PageModel.countDocuments()

      if (!pages || pages.length === 0) {
        throw new ApiErr(StatusCodes.NOT_FOUND, "No Pages Found")
      }

      return {
        pages,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      }
    } catch (error) {
      throw new ApiErr(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to fetch pages"
      )
    }
  }

  async deletePage(slug) {
    try {
      const result = await PageModel.findOneAndDelete({ slug })
      if (!result) throw new ApiErr(StatusCodes.NOT_FOUND, "Page not found")

      if (result.attachments) {
        const filePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "uploads",
          path.basename(result.attachments)
        )
        try {
          await fs.promises.unlink(filePath)
          console.log("File deleted:", filePath)
        } catch (unlinkError) {
          console.error("Failed to delete file:", unlinkError)
          // Optionally throw an error here if file deletion is critical
        }
      }

      return result
    } catch (error) {
      if (error instanceof ApiErr) throw error
      throw new ApiErr(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error,
        "Failed to delete page"
      )
    }
  }

  async getBySlug(slug) {
    try {
      const result = await PageModel.findOne({ slug })
      if (!result) throw new ApiErr(StatusCodes.NOT_FOUND, "Page not found")
      return result
    } catch (error) {
      if (error instanceof ApiErr) throw error
      throw new ApiErr(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to fetch page"
      )
    }
  }

  async updatePage(slug, data, account, file) {
    try {
      const newSlug = slugify(data.name)
      const updatedData = {
        ...data,
        updatedBy: account.username,
        slug: newSlug,
        updatedAt: new Date(),
      }

      if (file) {
        updatedData.attachments = file.path
      }

      const result = await PageModel.findOneAndUpdate({ slug }, updatedData, {
        new: true,
        runValidators: true,
      })

      if (!result) throw new ApiErr(StatusCodes.NOT_FOUND, "Page not found")

      return result
    } catch (error) {
      if (error instanceof ApiErr) throw error
      throw new ApiErr(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to update page"
      )
    }
  }
}

const pageService = new Page()

export default pageService
