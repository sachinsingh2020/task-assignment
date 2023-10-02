import express from 'express';
import { blogSearch, getBlogStats } from '../controllers/blogController.js';

const router = express.Router();

router.route('/blog-stats').get(getBlogStats);

router.route('/blog-search').get(blogSearch);

export default router;