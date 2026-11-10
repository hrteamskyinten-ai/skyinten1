import paymentHistoryModel from "../models/payment_history_schema.js";

// Add a new payment record
export const addPaymentHistory = async (req, res) => {
  try {
    const { userId, studentName, studentEmail, itemType, itemId, itemName, price, transactionStatus = 'completed' } = req.body;

    // Validate required fields
    if (!userId || !studentName || !studentEmail || !itemType || !itemId || !itemName || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Validate itemType
    if (!['course', 'hackathon'].includes(itemType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid itemType. Must be "course" or "hackathon"' 
      });
    }

    const paymentRecord = new paymentHistoryModel({
      userId,
      studentName,
      studentEmail,
      itemType,
      itemId,
      itemName,
      price: Number(price),
      transactionStatus
    });

    await paymentRecord.save();

    return res.json({
      success: true,
      message: 'Payment record added successfully',
      paymentRecord
    });
  } catch (error) {
    console.error('addPaymentHistory error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all payment history with filters
export const getAllPaymentHistory = async (req, res) => {
  try {
    const { itemType, sortBy = '-purchasedAt' } = req.query;

    let filter = {};
    if (itemType) {
      filter.itemType = itemType;
    }

    const paymentHistory = await paymentHistoryModel
      .find(filter)
      .sort(sortBy)
      .lean();

    return res.json({
      success: true,
      paymentHistory,
      total: paymentHistory.length
    });
  } catch (error) {
    console.error('getAllPaymentHistory error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get course purchasing history
export const getCoursePurchasingHistory = async (req, res) => {
  try {
    const coursePurchasing = await paymentHistoryModel
      .find({ itemType: 'course', transactionStatus: 'completed' })
      .sort({ purchasedAt: -1 })
      .lean();

    return res.json({
      success: true,
      coursePurchasing,
      total: coursePurchasing.length
    });
  } catch (error) {
    console.error('getCoursePurchasingHistory error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get hackathon purchasing history
export const getHackathonPurchasingHistory = async (req, res) => {
  try {
    const hackathonPurchasing = await paymentHistoryModel
      .find({ itemType: 'hackathon', transactionStatus: 'completed' })
      .sort({ purchasedAt: -1 })
      .lean();

    return res.json({
      success: true,
      hackathonPurchasing,
      total: hackathonPurchasing.length
    });
  } catch (error) {
    console.error('getHackathonPurchasingHistory error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get course fees summary (aggregated by item name)
export const getCourseFeeSummary = async (req, res) => {
  try {
    const courseFeeSummary = await paymentHistoryModel.aggregate([
      {
        $match: {
          itemType: 'course',
          transactionStatus: 'completed'
        }
      },
      {
        $group: {
          _id: '$itemId',
          name: { $first: '$itemName' },
          price: { $first: '$price' },
          enrolled: { $sum: 1 },
          totalRevenue: { $sum: '$price' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return res.json({
      success: true,
      courseFeeSummary,
      total: courseFeeSummary.length
    });
  } catch (error) {
    console.error('getCourseFeeSummary error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get hackathon fees summary (aggregated by item name)
export const getHackathonFeeSummary = async (req, res) => {
  try {
    const hackathonFeeSummary = await paymentHistoryModel.aggregate([
      {
        $match: {
          itemType: 'hackathon',
          transactionStatus: 'completed'
        }
      },
      {
        $group: {
          _id: '$itemId',
          name: { $first: '$itemName' },
          price: { $first: '$price' },
          enrolled: { $sum: 1 },
          totalRevenue: { $sum: '$price' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return res.json({
      success: true,
      hackathonFeeSummary,
      total: hackathonFeeSummary.length
    });
  } catch (error) {
    console.error('getHackathonFeeSummary error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment history by student email
export const getPaymentHistoryByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email parameter is required' 
      });
    }

    const paymentHistory = await paymentHistoryModel
      .find({ studentEmail: email, transactionStatus: 'completed' })
      .sort({ purchasedAt: -1 })
      .lean();

    return res.json({
      success: true,
      paymentHistory,
      total: paymentHistory.length
    });
  } catch (error) {
    console.error('getPaymentHistoryByEmail error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Clear/Delete payment history (for testing purposes - admin only)
export const deletePaymentHistory = async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment ID is required' 
      });
    }

    const result = await paymentHistoryModel.findByIdAndDelete(paymentId);

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment record not found' 
      });
    }

    return res.json({
      success: true,
      message: 'Payment record deleted successfully'
    });
  } catch (error) {
    console.error('deletePaymentHistory error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
