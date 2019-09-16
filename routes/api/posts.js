const express = require();
const router = express.Router();

// @route  GET api/posts
// @desc   Test route
// @access Public

router.get('/', (req, res) => res.send('posts route'));

module.exports = router;