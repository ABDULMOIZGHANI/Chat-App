import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import { User } from "../model/user.model.js";
import { Message } from "../model/message.model.js";
import { v2 as cloudinary } from "cloudinary";
import { getReeceiverSocketId, io } from "../utils/socket.js";

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  const filterdUsers = await User.find({ _id: { $ne: user } }).select(
    "-password"
  );
  res.status(200).json({
    success: true,
    users: filterdUsers
  });
});

export const getMessages = catchAsyncError(async (req, res, next) => {
  const receiverID = req.params.id;
  const myID = req.user._id;

  const receiver = await User.findById(receiverID);

  if (!receiver) {
    res.status(400).json({
      success: false,
      message: "Receiver ID Invalid"
    });
  }

  const messages = await Message.find({
    $or: [
      { senderId: myID, receiverId: receiverID },
      { senderId: receiverID, receiverId: myID }
    ]
  }).sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    messages
  });
});

export const sendMessage = catchAsyncError(async (req, res, next) => {
  const { text } = req.body;
  const media = req?.files?.media;

  const { id: receiverId } = req.params;

  const senderId = req.user._id;

  const receiver = await User.findById(receiverID);
  if (!receiver) {
    res.status(400).json({
      success: false,
      message: "Receiver ID Invalid"
    });
  }

  const sanitizedText = text?.trim() || "";

  if (!sanitizedText && media) {
    res.status(400).json({
      success: false,
      message: "Cannot Send empty message"
    });
  }

  let mediaUrl = "";

  if (media) {
    try {
      const uploadResponse = await cloudinary.uploader.upload(
        media.tempFilePath,
        {
          resource_type: "auto",
          folder: "CHAT_APP_MEDIA",
          transformation: [
            { width: 1080, height: 1080, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" }
          ]
        }
      );

      mediaUrl = uploadResponse?.secure_url;
    } catch (error) {
      console.log("Cloudinary Upload Error", error);

      return res.status(403).json({
        success: false,
        message: "Failed to upload media, please try again later"
      });
    }
  }

  const newMessage = await Message.create({
    senderId,
    receiverId,
    text: sanitizedText,
    media: mediaUrl
  });

  const receiverSocketId = getReeceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  res.status(201).json(newMessage);
});
