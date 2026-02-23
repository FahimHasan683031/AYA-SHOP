export type IProviderAnalytics = {
    last7Days: {
        date: string;
        views: number;
        bookings: number;
    }[];
    conversionRate: number;
    totalViews: number;
    totalBookings: number;
    packagePerformance: {
        name: string;
        bookings: number;
        revenue: number;
    }[];
};
