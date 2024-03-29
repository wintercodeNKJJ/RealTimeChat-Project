import { Request, Response } from "express";
import {
  createNewMessage,
  deleteUsersMessageById,
  getMessageById,
  updateUserMessageById,
  getMessageAllFomChatroomById,
} from "../directus/directusCrud.js";
import { sendErrorToClient } from "../utils/sendAndLogError.js";
import { io } from "../../server.js";
import { ChatApiError } from "../customErrors/customErrors.js";

/**
 * @description This methode creates a message by making a call to the directuse CRUD unit
 *
 * #### Minimal attributes requires to create a message
 * ```ts
 * {
 * id: number;
 * content: string;
 * senderId: number | UserType;
 * chatRoomId: number | ChatRoomType;
 * }
 * ```
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function createMessage(req: Request, res: Response) {
  try {
    const { body } = req;
    const message = await createNewMessage(body).catch(
      (error: ChatApiError) => {
        res.status(error.errorCode).json({
          error: error.errorCode,
          data: error,
        });
      },
    );

    io.emit("newMessage", message);
    if (message) {
      res.status(200).json({
        message: "new message created",
        data: message,
      });
    }
    return;
  } catch (error) {
    sendErrorToClient(res, "Could not create the message", error);
  }
}

/**
 * @description Fetch all the messages in a chatroom using the chatroom id
 *
 * #### Messages list
 * ```ts
 * {
 * id: number;
 * content: string;
 * senderId: number;
 * chatRoomId: number;
 * createdAt: Date;
 * updatedAt: Date;
 * responseToMessageId: number;
 * }[]
 * ```
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getMessagesInChatroomById(req: Request, res: Response) {
  try {
    const { chatRoomId } = req.params;

    await getMessageAllFomChatroomById(parseInt(chatRoomId))
      .then((messages) => {
        res.status(200).json({
          message: "Message fetched Successfully",
          data: messages,
        });
      })
      .catch((error: ChatApiError) => {
        res.status(error.errorCode).json({
          error: error.errorCode,
          data: error,
        });
      });

    return;
  } catch (error) {
    sendErrorToClient(
      res,
      "Could not get the messages in this chatroom",
      error,
    );
  }
}

/**
 * @description Fetch all the messages sent by a particular user
 *
 * #### Message list
 * ```ts
 * {
 * id: number;
 * content: string;
 * senderId: number;
 * chatRoomId: number;
 * createdAt: Date;
 * updatedAt: Date;
 * responseToMessageId: number| undefined;
 * }[]
 * ```
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getMessagesForUserById(req: Request, res: Response) {
  try {
    const { messageId } = req.params;
    await getMessageById(parseInt(messageId))
      .then((message) => {
        res.status(200).json({
          message: "Message fetched Successfully",
          data: message,
        });
      })
      .catch((error: ChatApiError) => {
        res.status(error.errorCode).json({
          error: error.errorCode,
          data: error,
        });
      });
  } catch (error) {
    sendErrorToClient(res, "Could not get the messages for this user", error);
  }
}

/**
 * @description Edits a message with the coresponding id on directus
 *
 * #### Editable content and id
 *  ```ts
 * {
 * id: number; // con not be modified
 * content: string;
 * }
 * ```
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function updateMessageById(req: Request, res: Response) {
  try {
    await updateUserMessageById(req.body).then((updatedMessage) => {
      res.status(200).json({
        message: "Message updated successfully",
        data: updatedMessage,
      });
    });
  } catch (error) {
    sendErrorToClient(res, "Could not update this message", error);
  }
}

/**
 * @description Delete a message with the corresponding id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function deleteAUserMessageById(req: Request, res: Response) {
  try {
    const { messageId } = req.params;
    await deleteUsersMessageById(parseInt(messageId)).then(() => {
      res.status(200).json({
        message: "message deleted sucessfully",
        data: null,
      });
    });
  } catch (error) {
    sendErrorToClient(res, "Could not delete this message", error);
  }
}
