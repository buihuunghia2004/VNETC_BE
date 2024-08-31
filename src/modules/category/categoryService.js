import { Category } from "~/models/categoryModel"
import { News } from "~/models/newsModel"
import slugify from "~/utils/stringToSlug"
import ApiErr from "~/utils/ApiError"
import mongoose from "mongoose";

const addCategory = async (data, profile) => {
    const { name, type, subcategories } = data
    const slug = slugify(name)

    const cateExists = await Category.exists({ name })
    if (cateExists) {
        throw new ApiErr(444, "Category already exists")
    }

    const category = new Category({
        _id: new mongoose.Types.ObjectId(),
        name,
        slug,
        type,
        createdBy: profile,
        subcategories: subcategories ? subcategories.map(subName => ({
            _id: new mongoose.Types.ObjectId(),
            name: subName,
            slug: slugify(subName)
        })) : [] // Nếu subcategories không co', gán []
    })

    await category.save()
    return category
}

const deleteCategory = async (id) => {
    try {
        const category = await Category.findById(id)
        if (!category) {
            throw new ApiErr(404, "Category not found")
        }

        if (await News.exists({ categoryId: category._id })) {
            throw new ApiErr(400, "Cannot delete category with associated news")
        }

        await category.deleteOne()
        return true
    } catch (error) {
        if (error instanceof ApiErr) throw error
        throw new ApiErr(500, "Error deleting category: " + error.message)
    }
}

const getCategories = async () => {
    try {
        return await Category.find()
    } catch (error) {
        throw new ApiErr(500, "Error fetching categories: " + error.message)
    }
}

const getCategoriesByType = async (type) => {
    try {
        return await Category.find({ type })
    } catch (error) {
        throw new ApiErr(500, "Error fetching categories by type: " + error.message)
    }
}

const updateCategory = async (id,{  name, updatedBy, subcategories }, profile) => {
    try {
        const updated = await Category.findByIdAndUpdate(
            id,
            {
                name,
                slug: slugify(name),
                updatedBy: profile,
                subcategories: subcategories.map(subName => ({
                    _id: new mongoose.Types.ObjectId(),
                    name: subName,
                    slug: slugify(subName)
                }))
            },
            { new: true, runValidators: true }
        )

        if (!updated) {
            throw new ApiErr(404, "Category not found")
        }
        return updated
    } catch (error) {
        if (error instanceof ApiErr) throw error
        throw new ApiErr(500, "Error updating category: " + error.message)
    }
}

export const categoryService = {
    addCategory,
    deleteCategory,
    updateCategory,
    getCategories,
    getCategoriesByType
}