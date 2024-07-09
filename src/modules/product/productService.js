import {StatusCodes} from "http-status-codes"
import cloudinary from "~/helper/cloundinary"
import {ProductDetail} from "~/models/productDetailModel"
import ApiErr from "~/utils/ApiError"
import {ObjectId} from "mongodb"
import uploadImageToCloudinary from "~/utils/uploadImage"
import mongoose from "mongoose";

const {Product} = require("~/models/productModel")

const create = async (req, creator) => {
    try {
        const uploadImage = await uploadImageToCloudinary(req.file.path);
        const productData = {
            ...req.body,
            image: uploadImage.secure_url,
            category_id: new ObjectId(req.body.categoryID),
            createdBy: creator
        };
        const product = new Product(productData);
        await product.save();
        // const productDetailData = {
        //     ...req.body,
        //     createdBy: creator,
        //     productId: product.id
        // };
        // const productDetail = new ProductDetail(productDetailData);
        // await productDetail.save();

        return product;
    } catch (error) {
        console.error("Error creating product:", error.message);
        throw error;
    }
};

const getAll = async (query) => {
    const {page = 0, limit = 8} = query
    const products = await Product.find()
        .skip(page * limit)
        .limit(limit)
    return products
}

const updateProduct = async (id, accountName, data, imageData) => {
    try {
        const {updateName: name, updateCate: category_id} = data;
        const {secure_url: image} = await uploadImageToCloudinary(imageData.path);
        const productData = {
            name,
            updatedBy: accountName,
            image,
            category_id
        };
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            productData,
            {new: true, runValidators: true}
        );
        if (!updatedProduct) throw new ApiErr(StatusCodes.UNAUTHORIZED, "UPDATE FAIL")
        return updatedProduct;
    } catch (error) {
        throw error;
    }
};


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
        }));

        const result = {
            id: product ? product._id : null,
            name: product ? product.name : null,
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
export const productService = {
    create,
    getAll,
    getProductById,
    updateProduct,
    createProductDetail,
    updateProductDetail,
    deleteProduct
}
