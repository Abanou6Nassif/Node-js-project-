import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      minLength: 3,
      required: true,
      trim: true,
    },
    userNumber: {
      type: Number,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/.test(value);
        },
        message: ({ value }) => `${value} Invalid Email`,
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    role: {
      type: String,
      required: true,
      default: "user",
      enum: ["user", "admin"],
    },
    profile: {
      type: {
        filename: String,
        path: String,
        publicId: String,
      },
      default: {
        filename: "default.png",
        path: "https://secure.gravatar.com/avatar/default?s=90&d=identicon",
        publicId: null,
      },
    },
    OTP: { type: String },
    resetOTPExpiration: { type: Date },
  },

  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (!this.userNumber) {
    const User = this.constructor;
    let isUnique = false;
    let randomNumber;

    while (!isUnique) {
      randomNumber = Math.floor(100000 + Math.random() * 900000);

      const existingUser = await User.findOne({ userNumber: randomNumber });
      if (!existingUser) {
        isUnique = true;
      }
    }

    this.userNumber = randomNumber;
  }
});

const userModel = mongoose.model("user", userSchema);

export default userModel;
