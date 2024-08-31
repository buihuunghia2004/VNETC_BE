import ApiErr from "~/utils/ApiError";
import {StatusCodes} from "http-status-codes";
import {LibraryVideo} from "~/models/libraryVideoModel";
import {LibraryImage} from "~/models/libraryImageModel";
import slugify from "~/utils/stringToSlug";
import {PageModel} from "~/models/PageModel";
import {PageRoute} from "~/routes/PageRoute";

function isValidUrl(input) {
    try {
        new URL(input);
        return true;
    } catch (err) {
        return false;
    }
}

class Page {
    async addPageService(data, account) {
        const slug = slugify(data.name);

        const result = new PageModel({
            ...data,
            slug: slug,
            createdBy: account.username
        });
        try {
            await result.save();
            return result;
        } catch (error) {

            throw error
        }
    }

    async getPage(page, limit) {

        const get = await PageModel.find();

        if (!get || get.length === 0) {
            throw new ApiErr(StatusCodes.NOT_FOUND, "No Page Found");
        }

        return get;
    }

    async deletePage(slug) {
        const result = await PageModel.findOneAndDelete({slug})
        if (!result) throw new ApiErr(StatusCodes.BAD_REQUEST, "Cant find Page by ID");
        return result
    }

    async getBySlug(slug) {
        const result = await PageModel.findOne({slug})
        if (!result) throw new ApiErr(StatusCodes.BAD_REQUEST, " Cant find by Slug")
        return result
    }

    async updatePage(slug, data, account) {
        try {
            const newSlug = slugify(data.name);
            const updatedData = {
                ...data,
                updatedBy: account.username,
                slug: newSlug
            };

            const result = await PageModel.findOneAndUpdate(
                {slug},
                updatedData,
            );

            return {result};
        } catch (e) {
            console.log(e)
            throw e
        }
    }
}

const pageService = new Page();

export default pageService;