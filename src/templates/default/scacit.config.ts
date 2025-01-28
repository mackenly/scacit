export default {
    site: {
        title: 'My Scacit Site',
        description: 'Built with Scacit',
        year: new Date().getFullYear(),
        robots: 'noindex, nofollow',
        baseUrl: 'http://localhost:3000',
    },
    build: {
        outDir: 'build',
        assets: {
            bundle: true,
            minify: true,
        },
    }
};