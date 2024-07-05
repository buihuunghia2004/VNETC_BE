const Joi = require("joi")
import { NAVIGATION } from "~/utils/appConst"
import { validConst as vc } from "~/utils/validConst"

const addNavigation = async (req, res, next) => {
  const correctObj = {
    type: vc.NUMBER.valid(NAVIGATION.PARENT,NAVIGATION.CHILD).required(),
    title: vc.STRING.required()
  }
  if (req.body.type == NAVIGATION.CHILD) {
    correctObj.parentNavId = vc.OBJECT_ID.required()
  }
  
  try {
    await Joi.object(correctObj).validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(error)
  }
}

export const navigationValidation = {
  addNavigation
}