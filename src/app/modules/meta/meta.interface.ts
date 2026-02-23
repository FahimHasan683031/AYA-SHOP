import { Types } from "mongoose";

export type IProviderAnalytics = {
    last7Days: {
        date: string;
        views: number;
        bookings: number;
    }[];
    conversionRate: number;
    totalViews: number;
    totalBookings: number;
    totalListing: number;
    packagePerformance: {
        name: string;
        bookings: number;
        revenue: number;
    }[];
};

export type IPublicStats = {
    totalProviders: number;
    totalJobsDone: number;
    totalServices: number;
};

export type IAdminAnalytics = {
    userStats: {
        total: number;
        active: number;
    };
    businessStats: {
        total: number;
        active: number;
    };
    totalServices: number;
    revenueStats: {
        total: number;
        thisMonth: number;
    };
    pendingApprovals: number;
    newSignupsLast7Days: number;
    recentUsers: any[];
    recentTransactions: any[];
};
