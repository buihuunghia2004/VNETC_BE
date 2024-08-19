import {StatusCodes} from "http-status-codes"
import {ChildNav, ParentNav} from "~/models/navigationModel"
import ApiErr from "~/utils/ApiError"
import {NAVIGATION as NAV} from "~/utils/appConst"
import slugify from "~/utils/stringToSlug"

const getAllNavigation = async () => {
    let parentNavs = await ParentNav.find({}, {title: 1, slug: 1});
    let childNavs = await ChildNav.find({}, {title: 1, parentNavId: 1, slug: 1});

    // Đệ quy izaBEST
    const buildTree = (navItems, parentId) => {
        return navItems
            .filter(nav => nav.parentNavId.toString() === parentId.toString())
            .map(nav => ({
                ...nav._doc,
                child: buildTree(navItems, nav._id)
            }));
    };

    return parentNavs.map(parent => ({
        ...parent._doc,
        childs: buildTree(childNavs, parent._id)
    }));
};


const getNavigationBySlug = async (slug) => {
    const parentNav = await ParentNav.findOne({slug}, {title: 1})
    if (!parentNav) {
        throw new ApiErr(StatusCodes.NOT_FOUND, "Not found")
    }
    const childNavs = await ChildNav.find({parentNavId: parentNav._id.toString()}, {title: 1})
    if (!childNavs) {
        throw new ApiErr(StatusCodes.NOT_FOUND, "Not found")
    }
    parentNav._doc.childs = childNavs
    return parentNav
}
const getNavigationById = async (id) => {
    const parentNav = await ParentNav.findById(id);

    if (!parentNav) {
        const childNav = await ChildNav.findById(id);
        if (!childNav) {
            throw new ApiErr(StatusCodes.NOT_FOUND, "Not found");
        }
        return childNav;
    }

    const childNavs = await ChildNav.find({parentNavId: parentNav._id});
    if (!childNavs.length) {
        throw new ApiErr(StatusCodes.NOT_FOUND, "Child navigations not found");
    }

    return {...parentNav.toObject(), childs: childNavs};
};


const addNavigation = async (data, creator) => {
    const {type, title, parentNavId} = data;
    const slug = slugify(title);

    if (type === NAV.PARENT) {
        const navExists = await ParentNav.exists({title});
        if (navExists) {
            throw new ApiErr(StatusCodes.CONFLICT, "Navigation already exists!");
        }
        console.log("vaoday");
        const nav = new ParentNav({title, slug, createdBy: creator});
        return await nav.save();
    } else {
        const [parentNavExist, childNavExists] = await Promise.all([ParentNav.exists({_id: parentNavId}), ChildNav.exists({
            parentNavId,
            title
        })]);
        // if (!parentNavExist) {
        //     throw new ApiErr(StatusCodes.NOT_FOUND, "Parent navigation not found!");
        // }
        if (childNavExists) {
            throw new ApiErr(StatusCodes.CONFLICT, "Navigation already exists");
        }

        const nav = new ChildNav({title, parentNavId, slug, createdBy: creator});
        return await nav.save();
    }
};
const updateNavigation = async (id, data, updater) => {
    let nav
    if (data.type === NAV.PARENT) {
        const {title} = data
        nav = await ParentNav.findById(id)
        if (!nav) {
            throw new ApiErr(StatusCodes.NOT_FOUND, "Parent navigation not found")
        }

        if (title && title !== nav.title) {
            const navExists = await ParentNav.exists({title})
            if (navExists) {
                throw new ApiErr(StatusCodes.CONFLICT, "Navigation with this title already exists")
            }
        }

        if (title) {
            nav.title = title
            nav.slug = slugify(title)
        }
        nav.updatedBy = updater

        await nav.save()
    } else {
        const {title} = data
        nav = await ChildNav.findById(id)
        if (!nav) {
            throw new ApiErr(StatusCodes.NOT_FOUND, "Child navigation not found")
        }
        // if (parentNavId && parentNavId !== nav.parentNavId.toString()) {
        //         const parentNavExists = await ParentNav.exists({_id: nav.parentNavId})
        //     if (!parentNavExists) {
        //         throw new ApiErr(StatusCodes.NOT_FOUND, "New parent navigation not found")
        //     }
        // }
        if (title && title !== nav.title) {
            const childNavExists = await ChildNav.exists({
                // parentNavId: parentNavId || nav.parentNavId,
                title, _id: {$ne: id}
            })
            if (childNavExists) {
                throw new ApiErr(StatusCodes.CONFLICT, "Child navigation with this title already exists")
            }
        }

        if (title) {
            nav.title = title
            nav.slug = slugify(title)
        }
        // if (parentNavId) {
        //     nav.parentNavId = parentNavId
        // }
        nav.updatedBy = updater

        await nav.save()
    }
    return nav
}
const deleteNaigation = async (data) => {
    const {type, id} = data
    let deleted
    if (type == NAV.PARENT) {
        deleted = await ParentNav.findByIdAndDelete(id)
    } else {
        deleted = await ChildNav.findByIdAndDelete(id)
    }
    if (!deleted) {
        throw new ApiErr(StatusCodes.CONFLICT, "Delete fail")
    }
    return deleted
}

export const navigationService = {
    getAllNavigation, getNavigationBySlug, addNavigation, deleteNaigation, getNavigationById, updateNavigation
}
