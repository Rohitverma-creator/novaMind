import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const conversation = await Conversation.create({
      userId,
    });

    return res.status(201).json(conversation);
  } catch (error) {
    return res.status(500).json({
      message: `Create conversation error: ${error.message}`,
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const conversations = await Conversation.find({
      userId,
    }).sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({
      message: `Get conversations error: ${error.message}`,
    });
  }
};
export const updateConversation = async (req, res) => {
  try {
    const { id, title } = req.body;

    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { title },
      { new: true },
    );



    return res.status(200).json(conversation);
  } catch (error) {
    console.log("UPDATE ERROR:", error);

    return res.status(500).json({
      message: `Update conversation error: ${error.message}`,
    });
  }
};

export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content,images,artifacts } = req.body;

    const message = await Message.create({
      conversationId,
      role,
      content,
      images,
      artifacts
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      updatedAt: new Date(),
    });

    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({
      message: `Save message error: ${error.message}`,
    });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversationId,
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({
      message: `Get message error: ${error.message}`,
    });
  }
};
