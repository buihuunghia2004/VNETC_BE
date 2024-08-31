import {StatusCodes} from "http-status-codes"
import cloudinary from "~/helper/cloundinary"
import {ProductDetail} from "~/models/productDetailModel"
import ApiErr from "~/utils/ApiError"
import {ObjectId} from "mongodb"
import uploadImageToCloudinary from "~/utils/uploadImage"
import mongoose from "mongoose";
import req from "express/lib/request";

const {Product} = require("~/models/productModel")

const create = async (req, creator) => {
    try {
        if (!req.files || !req.body) {
            throw new ApiErr(StatusCodes.BAD_REQUEST, "Invalid request data");
        }
        const uploadedImage = await uploadImageToCloudinary(req.files);
        const productData = {
            ...req.body,
            image: uploadedImage,
            category_id: new ObjectId(req.body.categoryID),
            createdBy: creator
        };
        const product = new Product(productData);
        await product.save();
        const productDetailData = {
            ...req.body,
            productId: product._id,
            createdBy: creator,
        };
        const productDetail = new ProductDetail(productDetailData);
        await productDetail.save();
        return product;
    } catch (error) {
        console.error("Error creating product:", error.message);
        throw error
    }
};


const getAll = async (data) => {
    const {page, limit, category_id} = data
    const query = category_id ? {category_id} : {};
    const products = await Product.find(query)
        .skip(limit * (page - 1))
        .limit(limit)
        .sort({createdAt: -1});
    return products
}
const updateProduct = async (id, accountName, data, imageData) => {
    try {
        if (!id || !accountName || !data || !imageData) {
            throw new ApiErr(StatusCodes.BAD_REQUEST, "Invalid input data");
        }
        const {updateName: name, updateCate: category_id} = data;
        const [imageUpload, product] = await Promise.all([
            uploadImageToCloudinary(imageData),
            Product.findById(id)
        ]);
        if (!product) {
            throw new ApiErr(StatusCodes.NOT_FOUND, "Product not found");
        }
        const updatedFields = {name, updatedBy: accountName, image: imageUpload, category_id};
        const productData = Object.keys(updatedFields).reduce((acc, key) => {
            if (updatedFields[key] !== undefined && updatedFields[key] !== product[key]) {
                acc[key] = updatedFields[key];
            }
            return acc;
        }, {});
        const result = await Promise.all([
            Product.findByIdAndUpdate(id, productData, {new: true, runValidators: true}),
            ProductDetail.findOneAndUpdate({productId: id}, {...data, updatedBy: accountName}, {
                new: true,
                runValidators: true
            })
        ]);

        return result;
    } catch (error) {
        console.error("Error updating product:", error.message);
        throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, "Error updating product");
    }
};


// const updateProduct = async (id, accountName, data, imageData) => {
//     try {
//         const {updateName: name, updateCate: category_id} = data;
//         const {secure_url: image} = await uploadImageToCloudinary(imageData.path);
//         const productData = {
//             name,
//             updatedBy: accountName,
//             image,
//             category_id
//         };
//         const updatedProduct = await Product.findByIdAndUpdate(
//             id,
//             productData,
//             {new: true, runValidators: true}
//         );
//         if (!updatedProduct) throw new ApiErr(StatusCodes.UNAUTHORIZED, "Cannot find Product ")
//         return updatedProduct;
//     } catch (error) {
//         throw error;
//     }
// };


const getProductById = async (id) => {
    try {
        const [product, productDetails] = await Promise.all([
            Product.findById(id).lean(),
            ProductDetail.find({productId: id}).lean()
        ]);

        if (!product && !productDetails.length) {
            throw new ApiErr(StatusCodes.NOT_FOUND, "Product not found");
        }


        const formattedDetails = productDetails.map(detail => ({
            brand: detail.brand,
            wattage: detail.wattage,
            weight: detail.weight,
            size: detail.size,
            warranty: detail.warranty,
            content: detail.content
        }));

        const result = {
            id: product ? product._id : null,
            name: product ? product.name : null,
            category_id: product ? product.category_id : null,
            image: product ? product.image : null,
            detail: formattedDetails,
        };

        return result;
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        throw error;
    }
};
const createProductDetail = async (id, accountName, data) => {
    try {
        const existingProductDetail = await ProductDetail.findOne({productId: id, brand: data.brand});
        if (existingProductDetail) {
            throw new ApiErr(StatusCodes.BAD_REQUEST, "Already exists for this product");
        }

        const productDetail = new ProductDetail({
            ...data,
            productId: id,
            createdBy: accountName,
        });

        await productDetail.save();
        return productDetail;
    } catch (error) {
        throw error;
    }
}
const updateProductDetail = async (id, data, user) => {
    try {
        const productData = {
            ...data,
            updatedBy: user.username,
        };
        const updatedProduct = await ProductDetail.findByIdAndUpdate(
            id,
            productData,
            {new: true}
        );
        if (!updatedProduct) {
            throw new ApiErr(StatusCodes.BAD_REQUEST, "Cannot find this product");
        }
        return updatedProduct;
    } catch (error) {
        throw error;
    }
}
const deleteProduct = async (id) => {
    try {
        const result = await Promise.all([
            Product.findByIdAndDelete(id),
            ProductDetail.deleteMany({productId: id})
        ]);
        if (!result[0]) throw new ApiErr(StatusCodes.BAD_REQUEST, "Cannot find this product");
        return result
    } catch (error) {
        throw error;
    }
}
const searchProducts = async (searchTerm, page, limit) => {
    try {
        if (!searchTerm) {
            throw new ApiErr(StatusCodes.BAD_REQUEST, "Search term is required");
        }

        const regex = new RegExp(searchTerm, 'i');
        const query = {name: regex};

        const [products, totalCount] = await Promise.all([
            Product.find(query)
                .skip(limit * (page - 1))
                .limit(limit)
                .sort({createdAt: -1}),
            Product.countDocuments(query)
        ]);

        const productsWithDetails = await Promise.all(products.map(async (product) => {
            const productDetails = await ProductDetail.find({productId: product._id}).lean();

            const formattedDetails = productDetails.map(detail => ({
                brand: detail.brand,
                wattage: detail.wattage,
                weight: detail.weight,
                size: detail.size,
                warranty: detail.warranty,
                content: detail.content
            }));

            return {
                id: product._id,
                name: product.name,
                category_id: product.category_id,
                image: product.image,
                detail: formattedDetails
            };
        }));

        const totalPages = Math.ceil(totalCount / limit);

        return {
            products: productsWithDetails,
            currentPage: page,
            totalPages,
            totalCount
        };
    } catch (error) {
        console.error("Error searching products:", error.message);
        throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, "Error searching products");
    }
};
export const productService = {
    create,
    getAll,
    getProductById,
    updateProduct,
    createProductDetail,
    updateProductDetail,
    deleteProduct,
    searchProducts
}
