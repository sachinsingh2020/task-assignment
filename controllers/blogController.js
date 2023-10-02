import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import axios from 'axios';
import _ from 'lodash';

const cache = {};

export const getBlogStats = catchAsyncError(async (req, res, next) => {
    try {

        if (cache.getBlogStats) {
            console.log('Returning cached blog stats');
            res.status(200).json(cache.getBlogStats);
            return;
        }

        const response = await axios.get(process.env.API_URL, {
            headers: {
                'x-hasura-admin-secret': process.env.ADMIN_SECRET,
            },
        });

        const responseData = response.data.blogs;

        const totalBlogs = _.size(responseData);
        const blogWithLongestTitle = _.maxBy(responseData, blog => blog.title.length);
        const blogsWithPrivacyTitle = _.filter(responseData, blog =>
            _.includes(_.toLower(blog.title), 'privacy')
        ).length;
        const uniqueBlogTitles = _.uniqBy(responseData, (blog) => blog.title.toLowerCase()).map((blog) => blog.title);

        const stats = {
            totalNumberOfBlogs: totalBlogs,
            blogWithLongestTitle: blogWithLongestTitle.title,
            numberOfBlogsWithPrivacyTitle: blogsWithPrivacyTitle,
            uniqueBlogTitles: uniqueBlogTitles,
        };

        cache.getBlogStats = stats;

        console.log('Fetching and caching blog stats');
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching data:', error);
        next(new ErrorHandler(500, 'Error fetching data'));
    }
});

export const blogSearch = catchAsyncError(async (req, res, next) => {
    const searchQuery = req.query.query;
    try {
        if (cache.blogSearch && cache.blogSearch[searchQuery]) {
            console.log('Returning cached search results');
            res.status(200).json(cache.blogSearch[searchQuery]);
            return;
        }

        const response = await axios.get(process.env.API_URL, {
            headers: {
                'x-hasura-admin-secret': process.env.ADMIN_SECRET,
            },
        });

        const responseData = response.data.blogs;

        const filteredData = searchQuery
            ? responseData.filter(blog =>
                _.includes(_.toLower(blog.title), _.toLower(searchQuery))
            )
            : responseData;

        if (!cache.blogSearch) {
            cache.blogSearch = {};
        }
        cache.blogSearch[searchQuery] = {
            data: filteredData,
        };

        console.log('Fetching and caching search results');
        res.status(200).json(cache.blogSearch[searchQuery]);
    } catch (error) {
        console.error('Error fetching data:', error);
        next(new ErrorHandler(500, 'Error fetching data'));
    }
});
