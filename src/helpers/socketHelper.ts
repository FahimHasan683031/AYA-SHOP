import colors from 'colors'
import { Server } from 'socket.io'
import { logger } from '../shared/logger'
import { MessageService } from '../app/modules/message/message.service'

const socket = (io: Server) => {
  io.on('connection', socket => {
    logger.info(colors.blue('A user connected'))

    //seen
    socket.on('seen', async (data) => {
      const { chatId, userId } = data;
      await MessageService.markAsRead(chatId, userId);
    });

    //disconnect
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'))
    })
  })
}

export const socketHelper = { socket }


