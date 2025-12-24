const fs = require("fs");
const path = require("path");

const { validationResult, Result } = require("express-validator");

const io = require("../socket");
const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Fetched Post Successfully ",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    // Validate request inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect");
      error.statusCode = 422;
      throw error;
    }

    // Ensure image file exists
    if (!req.file) {
      const error = new Error("No image provided");
      error.statusCode = 422;
      throw error;
    }

    // Normalize image path
    const imageUrl = req.file.path.replace(/\\/g, "/");

    // Extract post data
    const title = req.body.title;
    const content = req.body.content;

    // Create new post
    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: req.userId,
    });

    // Save post
    await post.save();

    // Find user and attach post
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    io.getIO().emit("posts", {
      action: "create",
      post: {
        ...post._doc,
        creator: { _id: req.userId, name: req.userId.name },
      },
    });
    // Send success response
    res.status(201).json({
      message: "Post created successfully",
      post: post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    // Default error code
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could Not Find Post");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Post Fetched", post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err); // in async throw wont work so next func to be used
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation Failed, entered data is incorrect");
      error.statusCode = 422;
      throw error;
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image; // existing image URL from client

    //  Convert only the NEW file path
    if (req.file) {
      imageUrl = req.file.path.replace(/\\/g, "/"); // Convert Windows slashes
    }

    if (!imageUrl) {
      const error = new Error("No file picked");
      error.statusCode = 422;
      throw error;
    }

    const post = await Post.findById(postId).populate("creator");
    if (!post) {
      const error = new Error("Could not find post");
      error.statusCode = 404;
      throw error;
    }
    //compare the current userId with logged in user
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not Authorized");
      error.statusCode = 403;
      throw error;
    }
    // If new image path differs → delete old file
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    // Update values
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;

    const result = await post.save();
    io.getIO().emit("posts", { action: "update", post: result });
    res.status(200).json({ message: "Updated Post", post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find post");
      error.statusCode = 404;
      throw error;
    }

    // Authorization check
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized");
      error.statusCode = 403;
      throw error;
    }

    // Delete image from file system
    clearImage(post.imageUrl);

    // Delete post
    await Post.findByIdAndDelete(postId);

    // Remove post reference from user
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    io.getIO().emit("posts", { action: "delete", post: postId });
    // Send response
    res.status(200).json({ message: "Deleted post successfully" });
  } catch (err) {
    // Default error code
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err); // forward to global error handler
  }
};

// delete a post helper func
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
