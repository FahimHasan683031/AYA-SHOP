const allowPaths = ['/api/v1/plan', '/api/v1/plan/create-checkout-session/:planId', "/api/v1/auth/add-phone"];

const isPathAllowed = (currentPath, allowedPaths) => {
    return allowedPaths.some(allowedPath => {
        const currentSegments = currentPath.split('/').filter(Boolean);
        const allowedSegments = allowedPath.split('/').filter(Boolean);

        if (currentSegments.length !== allowedSegments.length) return false;

        return allowedSegments.every((segment, index) => {
            return segment.startsWith(':') || segment === currentSegments[index];
        });
    });
};

const testCases = [
    '/api/v1/plan',
    '/api/v1/plan/create-checkout-session/12345',
    '/api/v1/auth/add-phone',
    '/api/v1/plan/create-checkout-session/12345/extra', // should fail
    '/api/v1/other', // should fail
    '/api/v1/plan/', // trailing slash - should be handled if split filters empty strings
    '/api/v1/plan/create-checkout-session' // missing param - should fail
];

testCases.forEach(path => {
    console.log(`${path}: ${isPathAllowed(path, allowPaths)}`);
});
