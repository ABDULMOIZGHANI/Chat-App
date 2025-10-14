import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"]
    },
    avatar: {
      public_id: {
        type: String
      },
      url: {
        type: String
      }
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", userSchema);
