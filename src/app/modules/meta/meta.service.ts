import { Booking } from "../booking/booking.model";
import { ViewHistory } from "../viewHistory/viewHistory.model";
import { Service } from "../service/service.model";
import { IProviderAnalytics } from "./meta.interface";
import mongoose from "mongoose";
import dayjs from "dayjs";

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

    const totalViews = totalViewsData[0]?.total || 1; // Avoid division by zero
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
                from: "services", // collection name for Service
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
        packagePerformance
    };
};

export const MetaService = {
    getProviderAnalyticsFromDB
};
