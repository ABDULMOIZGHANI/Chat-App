import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { generateJWTToken } from "../utils/jwtToken.js";
import { v2 as cloudinary } from "cloudinary";

export const signup = catchAsyncError(async (req, res, next) => {
  const { fullName, password, email } = req.body;

  const isEmailAlreadyExist = await User.findOne({ email });
  if (isEmailAlreadyExist) {
    return res.status(400).json({
      success: false,
      message: "Email Already Exist"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    avatar: {
      public_id: "",
      url: ""
    }
  });

  generateJWTToken(user, "User created Successfully", 201, res);
});

export const signin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Email is incorrect"
    });
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return res.status(400).json({
      success: false,
      message: "Password is incorrect"
    });
  }

  generateJWTToken(user, "User logged in successfuly", 200, res);
});

export const signout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      maxAge: 0,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development" ? true : false
    })
    .json({
      success: true,
      message: "User Logged  Out Successfully"
    });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { fullName, email } = req.body;

  if (fullName?.trim().length === 0 || email?.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Fullname and email can't be empty"
    });
  }

  const avatar = req?.files?.avatar;

  let cloudinaryResponse = {};

  if (avatar) {
    try {
      const oldAvatarPublicID = req.user?.avatar?.public_id;
      if (oldAvatarPublicID && oldAvatarPublicID.length > 0) {
        await cloudinary.uploader.destroy(oldAvatarPublicID);
      }

      cloudinaryResponse = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {
          folder: "CHAT_APP_USERS_AVATAR",
          transformation: [
            { widht: 300, height: 300, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" }
          ]
        }
      );
    } catch (error) {
      console.log("Cloudinary Upload Error", error);

      return res.status(403).json({
        success: false,
        message: "Failed to upload avatar, please try again later"
      });
    }
  }

  let data = {
    fullName,
    email
  };

  if (
    avatar &&
    cloudinaryResponse?.public_id &&
    cloudinaryResponse?.secure_url
  ) {
    data.avatar = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url
    };
  }

  let user = await User.findByIdAndUpdate(req.user._id, data, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: "Proile updated successfully",
    user
  });
});
