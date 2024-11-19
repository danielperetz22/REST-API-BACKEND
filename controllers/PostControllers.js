const Post = require('../models/PostModel');

exports.addPost = async (req ,res)=>{
    try{
        const post = new Post(req.body);
        await post.save();
        res.status(201).json(post);
    } 
    catch(error){
     res.status(500).json({error: error.message}); 
    }
};

exports.getAllPosts = async (req , res) => {
    try{
        const posts = await Post.find();
        res.status(200).json(posts);
    }
    catch(error) {
        res.status(500).json({error: error.message});

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
