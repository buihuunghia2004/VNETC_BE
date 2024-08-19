import {StatusCodes} from "http-status-codes"
import {ChildNav, ParentNav} from "~/models/navigationModel"
import ApiErr from "~/utils/ApiError"
import {NAVIGATION as NAV} from "~/utils/appConst"
import slugify from "~/utils/stringToSlug"

const buildChildTree = async (parentId) => {
    const childNavs = await ChildNav.find({ parentNavId: parentId }).lean();
    if (!childNavs.length) return [];
    return Promise.all(childNavs.map(async (child) => ({
        ...child,
        child: await buildChildTree(child._id)
    })));
};

const getAllNavigation = async () => {
    const parentNavs = await ParentNav.find({}, { title: 1, slug: 1 }).lean();
    const childNavs = await ChildNav.find({}, { title: 1, parentNavId: 1, slug: 1 }).lean();

    const buildTree = (navItems, parentId) => {
        return navItems
            .filter(nav => nav.parentNavId.toString() === parentId.toString())
            .map(nav => ({
                ...nav,
                child: buildTree(navItems, nav._id)
            }));
    };

    return parentNavs.map(parent => ({
        ...parent,
        childs: buildTree(childNavs, parent._id)
    }));
};

const getNavigationBySlug = async (slug) => {
    const parentNav = await ParentNav.findOne({ slug }, { title: 1 }).lean();
    if (!parentNav) {
        throw new ApiErr(StatusCodes.NOT_FOUND, "Not found");
    }

    const childNavs = await ChildNav.find({ parentNavId: parentNav._id.toString() }, { title: 1 }).lean();
    if (!childNavs.length) {
        throw new ApiErr(StatusCodes.NOT_FOUND, "Child navigations not found");
    }

    return { ...parentNav, childs: childNavs };
};

const getNavigationById = async (id) => {
    // Tìm mục điều hướng cha theo ID
    const parentNav = await ParentNav.findById(id).lean();

    if (parentNav) {
        // Nếu tìm thấy mục điều hướng cha, tìm tất cả các mục điều hướng con của mục cha
        const childTree = await buildChildTree(parentNav._id);
        return { ...parentNav, childs: childTree };
    }

    // Nếu không tìm thấy mục điều hướng cha, kiểm tra mục điều hướng con
    const childNav = await ChildNav.findById(id).lean();
    if (!childNav) {
        throw new ApiErr(StatusCodes.NOT_FOUND, "Not found");
    }

    // Đệ quy để tìm các mục điều hướng con của mục điều hướng con này
    const childTree = await buildChildTree(childNav._id);
    return { ...childNav, child: childTree };
};

const addNavigation = async (data, creator) => {
    const { type, title, parentNavId } = data;
    const slug = slugify(title);

    if (type === NAV.PARENT) {
        const navExists = await ParentNav.exists({ title });
        if (navExists) {
            throw new ApiErr(StatusCodes.CONFLICT, "Navigation already exists!");
        }

        const nav = new ParentNav({ title, slug, createdBy: creator });
        return await nav.save();
    } else {
        const [parentNavExists, childNavExists] = await Promise.all([
            ParentNav.exists({ _id: parentNavId }),
            ChildNav.exists({ parentNavId, title })
        ]);

        // if (!parentNavExists && childNavExists) {
        //     throw new ApiErr(StatusCodes.NOT_FOUND, "Parent navigation not found!");
        // }
        //
        // if (childNavExists) {
        //     throw new ApiErr(StatusCodes.CONFLICT, "Navigation already exists");
        // }

        const nav = new ChildNav({ title, parentNavId, slug, createdBy: creator });
        return await nav.save();
    }
};

const updateNavigation = async (id, data, updater) => {
    const { type, title, parentNavId } = data;
    let nav;

    if (type === NAV.PARENT) {
        nav = await ParentNav.findById(id);
        if (!nav) {
            throw new ApiErr(StatusCodes.NOT_FOUND, "Parent navigation not found");
        }

        if (title && title !== nav.title) {
            const navExists = await ParentNav.exists({ title });
            if (navExists) {
                throw new ApiErr(StatusCodes.CONFLICT, "Navigation with this title already exists");
            }
        }

        if (title) {
            nav.title = title;
            nav.slug = slugify(title);
        }
        nav.updatedBy = updater;
        await nav.save();
    } else {
        nav = await ChildNav.findById(id);
        if (!nav) {
            throw new ApiErr(StatusCodes.NOT_FOUND, "Child navigation not found");
        }

        if (title && title !== nav.title) {
            const childNavExists = await ChildNav.exists({
                title,
                _id: { $ne: id }
            });
            if (childNavExists) {
                throw new ApiErr(StatusCodes.CONFLICT, "Child navigation with this title already exists");
            }
        }

        if (title) {
            nav.title = title;
            nav.slug = slugify(title);
        }
        nav.updatedBy = updater;
        await nav.save();
    }

    return nav;
};

const deleteNavigation = async (data) => {
    const { type, id } = data;
    console.log(id)
    const deleted = type === NAV.PARENT
        ? await ParentNav.findByIdAndDelete(id)
        : await ChildNav.findByIdAndDelete(id);

    if (!deleted) {
        throw new ApiErr(StatusCodes.NOT_FOUND, "Delete failed");
    }

    return deleted;
};

export const navigationService = {
    getAllNavigation,
    getNavigationBySlug,
    getNavigationById,
    addNavigation,
    updateNavigation,
    deleteNavigation
};
