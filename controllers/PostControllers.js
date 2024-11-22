const Post = require('../models/PostModel');


exports.addPost = async (req, res) => {
    const { title, content, senderId } = req.body; // get title, content, and senderId from request body 

    console.log('Received POST request with data:', req.body);
    
    if (!title || !content || !senderId) {  // if any of the required fields are missing
        return res.status(400).json({
            message: 'Missing required fields: title, content, and senderId are required'
        });
    }

    try {
        const post = new Post(req.body); // create a new post object
        await post.save(); // save the post to the database

        return res.status(201).json({ 
            message: 'Post added successfully',
            post: post
        });
    } catch (error) {
        console.error('Error adding post:', error.message);

        return res.status(500).json({
            message: 'An error occurred while adding the post',
            error: error.message
        });
    }
};


exports.getAllPosts = async (req , res) => {
    try{ 
        const posts = await Post.find(); // fetch all posts from the database
        return res.status(200).json({
            message: 'Posts fetched successfully',
            posts: posts
        });
    }
    catch(error){ // if an error occurs while fetching the posts
        console.error('Error fetching posts:', error.message);

        return res.status(500).json({
            message: 'An error occurred while fetching the posts',
            error: error.message
        });
    } 
}

exports.getPostById = async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: `Post with ID ${postId} not found`
            });
        }

        return res.status(200).json({
            message: 'Post fetched successfully',
            post: post
        });
    } catch (error) {
        console.error(`Error fetching post with ID ${postId}:`, error.message);

        return res.status(500).json({
            message: 'An error occurred while fetching the post',
            error: error.message
        });
    }
};


exports.getPostsBySender = async (req, res) => {
    const senderId = req.query.senderId;

    if (!senderId) {
        return res.status(400).json({
            message: 'Sender ID is required'
        });
    }

    try {
        const posts = await Post.find({ senderId });

        if (posts.length === 0) {
            return res.status(404).json({
                message: `No posts found for sender ID ${senderId}`
            });
        }

        return res.status(200).json({
            message: 'Posts fetched successfully',
            posts: posts
        });
    } catch (error) {
        console.error(`Error fetching posts for sender ID ${senderId}:`, error.message);

        return res.status(500).json({
            message: 'An error occurred while fetching the posts',
            error: error.message
        });
    }
};

exports.updatePost = async (req, res) => {
    const postId = req.params.id;
    const updatePost = req.body;

    console.log('Received PUT request for ID:', postId);
    console.log('Update data:', updatePost);

    try {
        if(!postId) { // if post ID is missing
            return res.status(400).json({
                message: 'Post ID is required'
            });
        }
        const post = await Post.findById(postId);
        if(!post) { // if post is not found
            return res.status(404).json({
                message: `Post with ID ${postId} not found`
            });
        }
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            updatePost,
            { new: true, runValidators: true }
        );
        return res.status(200).json({
            message: 'Post updated successfully',
            post: updatedPost
        });
    } catch(error) {
        console.error(`Error updating post with ID ${postId}:`, error.message);

        return res.status(500).json({
            message: 'An error occurred while updating the post',
            error: error.message
        });
    }
};

