const Phone = require('../models/Phone');


//抓取所有手机根据关键字 if any
exports.getPhones = async (req, res) => {
  const { search, brand, minPrice, maxPrice } = req.query;
  const query = {};

  // 搜索 title 部分匹配（模糊、不区分大小写）
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  // 品牌筛选（非 All）
  if (brand && brand !== 'All') {
    query.brand = brand;
  }

  // 价格范围筛选
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // 只返回启用的、还有库存的商品
  query.stock = { $gt: 0 };
  query.disabled = { $ne: true };

  try {
    const phones = await Phone.find(query)
        .populate('seller', 'firstname lastname') //提供的是数据结构是firstname和lastname，不要用驼峰命名
        .populate('reviews.reviewer', 'firstname lastname');
    res.json(phones);
  } catch (err) {
    console.error('Error in getPhones:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

//抓取所有品牌
exports.getBrands = async (req, res) => {
  try {
    const brands = await Phone.distinct('brand');
    res.json(['All', ...brands]); // 默认第一个是 All
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
};

// 获得最大价格
exports.getMaxPrice = async (req, res) => {
  try {
    const max = await Phone.find().sort({ price: -1 }).limit(1);
    const maxPrice = max[0]?.price || 1000;
    res.json({ maxPrice });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get max price' });
  }
};

// 获取启用状态下，库存大于1且库存最少的5个手机
exports.getSoldOutSoon = async (req, res) => {
  try {
    const phones = await Phone.find({
      stock: { $gt: 0 },
      isActive: { $ne: false }  // 只排除明确为 false 的情况，未设置的也当 true
    })
      .sort({ stock: 1 })
      .limit(5);

    res.json(phones);
  } catch (err) {
    console.error('Error in getSoldOutSoon:', err);
    res.status(500).json({ error: 'Failed to fetch sold-out-soon phones' });
  }
};

// 获取综合评分最高的前5个手机，至少要有两个评分
exports.getBestSellers = async (req, res) => {
  try {
    const phones = await Phone.find({
      isActive: { $ne: false } // 排除 isActive: false，保留 true 和 undefined
    }).lean();

    const ratedPhones = phones
      .filter(p => p.reviews && p.reviews.length >= 2)
      .map(p => {
        const avgRating =
          p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length;
        return { ...p, avgRating };
      });

    const topRated = ratedPhones
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);

    res.json(topRated);
  } catch (err) {
    console.error('Error in getBestSellers:', err);
    res.status(500).json({ error: 'Failed to fetch best sellers' });
  }
};

//Fuc used in Profile Page
//get data
exports.getUserListings = async (req, res) => {
  try {
    const listings = await Phone.find({ seller: req.params.userId });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching user listings.' });
  }
};

//Create listing
exports.createListing = async (req, res) => {
  try {
    const newListing = new Phone(req.body);
    const saved = await newListing.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to create listing.' });
  }
};

//Listing Status
exports.toggleListingStatus = async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.listingId);
    if (!phone) return res.status(404).json({ msg: 'Listing not found' });

    phone.enabled = !phone.enabled;
    await phone.save();
    res.json({ enabled: phone.enabled });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update status' });
  }
};

//delete listing
exports.deleteListing = async (req, res) => {
  try {
    await Phone.findByIdAndDelete(req.params.listingId);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete listing' });
  }
};

//Comment Visibility
exports.toggleCommentVisibility = async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.listingId);
    if (!phone) return res.status(404).json({ msg: 'Listing not found' });

    const comment = phone.reviews.id(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });

    comment.hidden = !comment.hidden;
    await phone.save();

    res.json({ hidden: comment.hidden });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to toggle comment visibility' });
  }
};

// Comment Hide
exports.updateReviewViewActive = async (req, res) => {
  const { listingId, reviewId } = req.params; // 这里 reviewId 是 reviewer 的ID

  try {
    const phone = await Phone.findById(listingId);
    if (!phone) return res.status(404).json({ message: 'Listing not found' });

    // 用 reviewer 字段匹配
    const review = phone.reviews.find(r => r.reviewer.toString() === reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // 切换 hidden 状态
    if (review.hidden === "true") {
      review.hidden = "false";
    } else if (review.hidden === "false") {
      review.hidden = "true";
    } else {
      review.hidden = "false";
    }


    await phone.save();

    res.status(200).json({
      message: 'Review hide/show toggled successfully',
      hidden: review.hidden,
    });
  } catch (error) {
    console.error('Error toggling review hidden:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getPhoneById = async (req, res) => {
  const { id } = req.params;

  try {
    const phone = await Phone.findById(id)
      .populate('seller', 'firstname lastname email')               // 卖家信息
      .populate('reviews.reviewer', 'firstname lastname email');    // 评论者信息

    if (!phone) {
      return res.status(404).json({ error: 'Phone not found' });
    }

    res.json(phone);
  } catch (err) {
    console.error('Error fetching phone details:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


// Main page: addReview
exports.addReview = async (req, res) => {
  try {
    const listingId = req.params.listingId;
    const phone = await Phone.findById(listingId);
    if (!phone) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const { reviewer, rating, comment } = req.body;

    // 添加评论
    phone.reviews.push({ reviewer, rating, comment});
    await phone.save();

    // 再查一次并 populate
    const updatedPhone = await Phone.findById(listingId)
      .populate('reviews.reviewer', 'firstname lastname email');

    res.status(201).json({
      message: 'Review added',
      reviews: updatedPhone.reviews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//new get review data (can used in profile)
exports.getPublicReviews = async (req, res) => {
  const { listingId } = req.params;

  try {
    const phone = await Phone.findById(listingId).populate('reviews.reviewer', 'firstname lastname');

    if (!phone) {
      return res.status(404).json({ message: 'Phone not found' });
    }

    // 过滤规则：hidden === "true" 隐藏，其他显示
    const publicReviews = phone.reviews.filter(r => {
      return !(r.hidden === true || r.hidden === "true");
    });

    res.status(200).json(publicReviews);
  } catch (err) {
    console.error('Error fetching public reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


