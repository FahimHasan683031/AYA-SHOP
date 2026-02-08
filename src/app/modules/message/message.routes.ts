import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import { MessageController } from './message.controller';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';

const router = express.Router();

// Send a message
router.post('/',
  auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS, USER_ROLES.ADMIN),
  fileAndBodyProcessorUsingDiskStorage(),
  MessageController.sendMessage
);

// Get messages for a chat
router.get(
  '/:id',
  auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS, USER_ROLES.ADMIN),
  MessageController.getMessage
);

// Update a message
router.patch(
  '/:id',
  auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS, USER_ROLES.ADMIN),
  MessageController.updateMessage
);

// Get total unread count
router.get(
  '/unread/count',
  auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS, USER_ROLES.ADMIN),
  MessageController.getUnreadCount
);

// Delete a message
router.delete(
  '/:id',
  auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS, USER_ROLES.ADMIN),
  MessageController.deleteMessage
);

export const MessageRoutes = router;
