import mongoose from "mongoose";
import dayjs from "dayjs";
import { User } from "../user/user.model";
import { BOOKING_STATUS } from "../../../enum/booking";
import { USER_ROLES } from "../user/user.interface";
import { IPublicStats, IProviderAnalytics, IAdminAnalytics } from "./meta.interface";
import { Booking } from "../booking/booking.model";
import { ViewHistory } from "../viewHistory/viewHistory.model";
import { Service } from "../service/service.model";

const getProviderAnalyticsFromDB = async (providerId: string): Promise<IProviderAnalytics> => {
    const last7Days = [];
    const today = dayjs();

    // 1. Get views and bookings for last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = today.subtract(i, 'day').format('YYYY-MM-DD');

        const viewsCount = await ViewHistory.aggregate([
            { $match: { provider: new mongoose.Types.ObjectId(providerId), date } },
            { $group: { _id: null, total: { $sum: "$count" } } }
        ]);

        const bookingsCount = await Booking.countDocuments({
            provider: new mongoose.Types.ObjectId(providerId),
            createdAt: {
                $gte: dayjs(date).startOf('day').toDate(),
                $lte: dayjs(date).endOf('day').toDate()
            }
        });

        last7Days.push({
            date: dayjs(date).format('ddd'), // Mon, Tue, etc.
            views: viewsCount[0]?.total || 0,
            bookings: bookingsCount
        });
    }

    // 2. Aggregate total stats
    const totalStats = await Booking.aggregate([
        { $match: { provider: new mongoose.Types.ObjectId(providerId) } },
        {
            $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" }
            }
        }
    ]);

    const totalViewsData = await ViewHistory.aggregate([
        { $match: { provider: new mongoose.Types.ObjectId(providerId) } },
        { $group: { _id: null, total: { $sum: "$count" } } }
    ]);

    const totalViews = totalViewsData[0]?.total || 1; 
    const totalBookings = totalStats[0]?.totalBookings || 0;
    const conversionRate = parseFloat(((totalBookings / totalViews) * 100).toFixed(1));

    // 3. Package Performance (Top 3 services)
    const packagePerformance = await Booking.aggregate([
        { $match: { provider: new mongoose.Types.ObjectId(providerId) } },
        {
            $group: {
                _id: "$service",
                bookings: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
            }
        },
        { $sort: { revenue: -1 } },
        { $limit: 3 },
        {
            $lookup: {
                from: "services",
                localField: "_id",
                foreignField: "_id",
                as: "serviceDetails"
            }
        },
        { $unwind: "$serviceDetails" },
        {
            $project: {
                _id: 0,
                name: "$serviceDetails.name",
                bookings: 1,
                revenue: 1
            }
        }
    ]);
    const totalListing = await Service.countDocuments({
        provider: new mongoose.Types.ObjectId(providerId)
    });

    return {
        last7Days,
        conversionRate,
        totalViews: totalViews === 1 && totalViewsData.length === 0 ? 0 : totalViews,
        totalBookings,
        totalListing,
        totalRevenue: totalStats[0]?.totalRevenue || 0,
        packagePerformance
    };
};

const getAdminAnalyticsFromDB = async (): Promise<IAdminAnalytics> => {
    // 1. User Stats
    const totalUsers = await User.countDocuments({ role: USER_ROLES.CLIENT });
    const activeUsers = await User.countDocuments({ role: USER_ROLES.CLIENT, status: "active" });

    // 2. Business Stats
    const totalBusinesses = await User.countDocuments({ role: USER_ROLES.BUSINESS });
    const activeBusinesses = await User.countDocuments({
        role: USER_ROLES.BUSINESS,
        status: "active",
        "business.businessStatus": "approved"
    });

    // 3. Service Stats
    const totalServices = await Service.countDocuments();

    // 4. Custom Card Metrics
    const totalUsersCount = await User.countDocuments({ role: { $in: [USER_ROLES.CLIENT, USER_ROLES.BUSINESS] } });
    const activeUsersCount = await User.countDocuments({ status: "active", role: { $in: [USER_ROLES.CLIENT, USER_ROLES.BUSINESS] } });
    const totalBusinessesCount = await User.countDocuments({ role: USER_ROLES.BUSINESS });
    const pendingBusinessCount = await User.countDocuments({
        role: USER_ROLES.BUSINESS,
        "business.businessStatus": { $in: ["pending", "resubmitted"] }
    });

    // 4. Revenue Stats
    const revenueData = await Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
            $group: {
                _id: null,
                total: { $sum: "$totalAmount" },
                thisMonth: {
                    $sum: {
                        $cond: [
                            { $gte: ["$createdAt", dayjs().startOf('month').toDate()] },
                            "$totalAmount",
                            0
                        ]
                    }
                }
            }
        }
    ]);

    // 5. Pending Approvals
    const pendingApprovals = await User.countDocuments({
        role: USER_ROLES.BUSINESS,
        "business.businessStatus": { $in: ["pending", "resubmitted"] }
    });

    // 6. New Signups (Last 7 days)
    const newSignupsLast7Days = await User.countDocuments({
        role: USER_ROLES.CLIENT,
        createdAt: { $gte: dayjs().subtract(7, 'day').toDate() }
    });

    // 7. Recent Users
    const recentUsers = await User.find({ role: USER_ROLES.CLIENT })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullName email image status createdAt");

    // 8. Recent Transactions
    const recentTransactions = await Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "fullName image")
        .select("user totalAmount status createdAt service");

    return {
        totalUsers: totalUsersCount,
        activeUsers: activeUsersCount,
        totalBusinesses: totalBusinessesCount,
        pendingBusiness: pendingBusinessCount,
        userStats: { total: totalUsers, active: activeUsers },
        businessStats: { total: totalBusinesses, active: activeBusinesses },
        totalServices,
        revenueStats: {
            total: revenueData[0]?.total || 0,
            thisMonth: revenueData[0]?.thisMonth || 0
        },
        pendingApprovals,
        newSignupsLast7Days,
        recentUsers,
        recentTransactions
    };
};

const getPublicStatsFromDB = async (): Promise<IPublicStats> => {
    const totalProviders = await User.countDocuments({ role: USER_ROLES.BUSINESS });
    const totalJobsDone = await Booking.countDocuments({ status: BOOKING_STATUS.COMPLETED });
    const totalServices = await Service.countDocuments();

    return {
        totalProviders,
        totalJobsDone,
        totalServices
    };
};

export const MetaService = {
    getProviderAnalyticsFromDB,
    getPublicStatsFromDB,
    getAdminAnalyticsFromDB
};
