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
