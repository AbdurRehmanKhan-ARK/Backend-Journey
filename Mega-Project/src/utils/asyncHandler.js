// asyncHandler: wraps async route handlers/controllers to avoid repeating try-catch
// in every single one. Two common implementations exist:
// 1. try-catch based (below) — sends the error response directly
// 2. Promise.resolve().catch() based — forwards error to next(), letting
//    Express's centralized error-handling middleware format the response
// The Promise-based version is generally preferred since it keeps error
// formatting in one place instead of duplicating it inside asyncHandler itself.

/*

export const asyncHandler = (fn) => async (req, res, next) => {
  // fn = the actual controller function passed in (e.g. getUser, createUser)
  // asyncHandler wraps it so we don't repeat try-catch in every controller
  try {
    await fn(req, res, next); // run the controller, wait for it to finish
  } catch (error) {
    // if the controller throws (DB error, validation error, etc.), catch it here
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
}; 

⭐ Interview point: This is a closure - asyncHandler(fn) returns a new function that "remembers" fn even after asyncHandler itself has finished executing. */

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };