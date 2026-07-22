import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // useful in searching in database
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary URL stored here
      required: true,
    },
    coverImage: {
      type: String, // cloudinary URL stored here
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// using a hook/middleware to encrypt user passwords
// don't use arrow function syntax - it doesn't bind 'this', and we need 'this'
// to access the current document. Using async because hashing is a long-running task.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password"))
    // early exit, no next() needed
    this.password = await bcrypt.hash(this.password, 10); // must await — hash() returns a Promise
});

// verify user's given password against the stored hashed password
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password); // (passwordEntered, hashedPasswordInDb)
};

// WHY ACCESS TOKENS + REFRESH TOKENS EXIST - the theory before we touch
// loginUser method in userController.js. This is the standard JWT-based auth pattern used by most
// production APIs (not just this course) - understanding WHY each piece
// exists matters more than memorizing the code.
//
// THE CORE PROBLEM THIS SOLVES:
// HTTP is stateless - the server doesn't "remember" who you are between
// requests. Every single request needs some proof of identity attached
// to it. Sending username/password on every request would be insane
// (imagine re-typing your password to like a single Instagram photo).
// So instead, after login, the server gives you a TOKEN - a signed
// piece of proof you attach to every future request instead of your
// actual credentials.
//
// WHY TWO TOKENS INSTEAD OF ONE:
// This is the part most beginners skip past, but it's the actual
// design decision worth understanding.
//
// 1. ACCESS TOKEN - short-lived (e.g. 15min - 1d), sent with EVERY
//    request to prove identity. Server verifies it, lets the request
//    through. Because it's short-lived, if it ever gets stolen
//    (XSS attack, leaked in logs, intercepted), the attacker only has
//    a small window before it expires - limits the blast radius.
//
// 2. REFRESH TOKEN - long-lived (e.g. 7-30d), NOT sent with every
//    request. Its ONLY job is: when the access token expires, use
//    the refresh token to get a NEW access token, without forcing
//    the user to log in again with their password.
//
// WHY NOT JUST USE ONE LONG-LIVED TOKEN?
// Because then you're stuck between two bad options:
//   - Make it short-lived -> user gets logged out constantly, terrible UX
//   - Make it long-lived -> if it leaks, attacker has access for weeks,
//     with no way to force a "silent" re-verification
// Splitting the job into two tokens gives you BOTH: short exposure
// window on the token that travels constantly (access token), AND
// long-lived convenience on the token that rarely travels (refresh
// token) - because refresh token is only sent to ONE specific endpoint
// (/refresh-token), not attached to every single API call like the
// access token is. Less exposure = less risk.
//
// WHERE THESE TOKENS LIVE:
// - Access token: usually sent in the Authorization header
//   (Bearer <token>) OR as an httpOnly cookie - attached on every
//   protected route request.
// - Refresh token: stored as an httpOnly, secure cookie (NEVER in
//   localStorage - JS-accessible storage is vulnerable to XSS, an
//   attacker's injected script could just read localStorage and steal
//   it. httpOnly cookies can't be read by JS at all, only sent
//   automatically by the browser to the server).
//
// WHY WE ALSO STORE refreshToken IN THE DATABASE (on the User document):
// This lets the server invalidate a refresh token on demand - e.g. on
// logout, or if a user reports their account compromised, we clear the
// stored refreshToken in the DB. Even if an attacker still physically
// has the old refresh token cookie, the server will reject it because
// it no longer matches what's saved in the DB. This is what makes
// "logout" actually mean something server-side (a stateless JWT alone
// can't be "revoked" - it's valid until it expires, period - storing
// it DB-side gives us a revocation mechanism).
//
// THE FULL LIFECYCLE:
// 1. User logs in with username/password (verified once, the ONLY
//    time password touches the wire in plaintext-over-HTTPS)
// 2. Server generates BOTH tokens, sends them back (as cookies),
//    and saves the refreshToken in the User's DB document
// 3. Every subsequent request -> access token proves identity,
//    verified via jwt.verify(), request proceeds
// 4. Access token expires -> request gets rejected (401) -> frontend
//    automatically calls /refresh-token endpoint, sending the
//    refresh token cookie
// 5. Server checks: is this refresh token valid (jwt.verify) AND does
//    it match what's stored in the DB for this user? If yes -> issues
//    a brand new access token (and often a new refresh token too -
//    "rotation") -> user never noticed anything happened
// 6. Refresh token ALSO expires eventually (after 7-30 days) -> user
//    is finally forced to log in again with password - this is the
//    outer boundary of the whole system
//
// LOGOUT, under this model, simply means: clear the refreshToken field
// in the DB (set to undefined/null) AND clear both cookies from the
// browser. Even if someone still has the old tokens, the DB check on
// refresh will fail, and the access token will expire naturally soon
// after - effectively kicking them out.

// access token usually holds high payload — short-lived
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// refresh token holds low payload (just ID) — long-lived
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
