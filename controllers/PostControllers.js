const Post = require('../models/post');

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