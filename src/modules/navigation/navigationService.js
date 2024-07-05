import { StatusCodes } from "http-status-codes"
import { ChildNav, ParentNav } from "~/models/navigationModel"
import ApiErr from "~/utils/ApiError"
import { NAVIGATION as NAV } from "~/utils/appConst"
import slugify from "~/utils/stringToSlug"

const getAllNavigation = async () => {
  let parentNavs = await ParentNav.find({}, { title: 1 })
  let childNavs = await ChildNav.find({}, { title: 1, parentNavId: 1 })

  return parentNavs.map(parent => {
    const childs = childNavs.filter(child => parent._id.toString() === child.parentNavId.toString());
    return { ...parent._doc, childs }
  })
}

const getNavigationBySlug = async (slug) => {
  const parentNav = await ParentNav.findOne({ slug }, { title: 1 })
  if (!parentNav) {
    throw new ApiErr(StatusCodes.NOT_FOUND,'Not found')
  }
  const childNavs = await ChildNav.find(
    { parentNavId: parentNav._id.toString() },
    { title: 1 }
  )
  if (!childNavs) {
    throw new ApiErr(StatusCodes.NOT_FOUND,'Not found')
  }
  parentNav._doc.childs = childNavs
  return parentNav
}

const addNavigation = async (data, creator) => {
  let nav
  if (data.type == NAV.PARENT) {
    const { title } = data
    //check navigation exists
    const navExists = await ParentNav.exists({ title })
    if (navExists) {
      throw new ApiErr(StatusCodes.CONFLICT,'Navigation is exists!')
    }

    nav = new ParentNav({
      title,
      slug:slugify(title),
      createdBy:creator
    })

    await nav.save()
  } else {
    const { title, parentNavId } = data
    //check parentNavigation
    const parentNavExist = await ParentNav.exists({_id:parentNavId})
    if (!parentNavExist) {
      throw new ApiErr(StatusCodes.NOT_FOUND, 'Not found parent navigation')
    }
    //check parentNavigation
    const childNavExists = await ChildNav.exists({parentNavId,title})
    if (childNavExists) {
      throw new ApiErr(StatusCodes.CONFLICT, 'Navigation is exists')
    }
    nav = new ChildNav({title,parentNavId,createdBy:creator})
    await nav.save()
  }
  return nav
}

const deleteNaigation = async (data) => {
  const {type, navId} = data
  let deleted
  if (type == NAV.PARENT) {
    deleted= await ParentNav.findByIdAndDelete(navId)
  }else{
    deleted= await ChildNav.findByIdAndDelete(navId)
  }
  if (!deleted) {
      throw new ApiErr(StatusCodes.CONFLICT,'Delete fail')
  }
  return deleted
}

export const navigationService = {
  getAllNavigation,
  getNavigationBySlug,
  addNavigation,
  deleteNaigation,
}
