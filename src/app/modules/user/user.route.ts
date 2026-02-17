import express from 'express'
import { UserController } from './user.controller'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { UserValidations } from './user.validation'
import { USER_ROLES, ADMIN_ROLES } from '../../../enum/user'
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody'

const router = express.Router()

router.get(
  '/me',
  auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS, USER_ROLES.ADMIN),
  UserController.getProfile,
)
router.get('/', auth(USER_ROLES.ADMIN), UserController.getAllUser);
router.patch(
  '/profile',
  auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS, USER_ROLES.ADMIN),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(UserValidations.userUpdateSchema),
  UserController.updateProfile,
)

router.patch(
  '/business-profile',
  auth(USER_ROLES.BUSINESS),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(UserValidations.updateBusinessSchema),
  UserController.updateBusinessProfile,
)

// delete my account
router.delete(
  '/me',
  auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS, USER_ROLES.ADMIN),
  UserController.deleteMyAccount,
)

// get single user
router.get('/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.BUSINESS, USER_ROLES.CLIENT),
  UserController.getSingleUser
)

router.patch(
  '/business-status/:id',
  auth(USER_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN),
  validateRequest(UserValidations.updateBusinessStatusSchema),
  UserController.updateBusinessStatus
)


// delete user
router.delete('/:id',
  auth(USER_ROLES.ADMIN),
  UserController.deleteUser
)

export const UserRoutes = router
