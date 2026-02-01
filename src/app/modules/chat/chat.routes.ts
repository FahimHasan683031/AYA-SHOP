import express from 'express';
import { ChatController } from './chat.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.interface';
import { ADMIN_ROLES } from '../../../enum/user';

const router = express.Router();

// Create a regular chat between users
router.post(
  "/",
  auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS),
  async (req, res, next) => {
    try {
      req.body = {
        participants: [req.user.authId, req.body.participant],
        isAdminSupport: false
      };
      next();
    } catch (error) {
      res.status(400).json({ message: "Failed to create chat" });
    }
  },
  ChatController.createChat
);

// Create admin support chat
router.post(
  "/admin-support",
  auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS, ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN),
  ChatController.createAdminSupport
);

// Get all chats for current user
router.get(
  "/",
  auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS, ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN),
  ChatController.getChat
);

// Get all admin support chats (admin only)
router.get(
  "/admin-support/all",
  auth(ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN),
  ChatController.getAdminSupportChats
);

// Delete a chat
router.delete(
  "/:id",
  auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS, ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN),
  ChatController.deleteChat
);

// Check support availability
router.get(
  "/support-availability",
  auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS),
  ChatController.getSupportAvailability
);

export const ChatRoutes = router;
