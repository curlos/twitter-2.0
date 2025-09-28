
const getTopHeadlines = async (country = 'us') => {
    try {
        const response = await fetch(
            `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`,
            {
                method: 'GET'
            }
        );

        return await response.json();
    } catch (error) {
        console.error(error);
    }
};

const getLatestNews = async () => {
    try {
        const response = await fetch(
            `https://newsdata.io/api/1/latest?apikey=${process.env.NEXT_PUBLIC_NEWSDATA_API_KEY}&language=en&country=us&prioritydomain=top&removeduplicate=1`,
            {
                method: 'GET'
            }
        );

        return await response.json();
    } catch (error) {
        console.error(error);
    }
};

export {
    getTopHeadlines,
    getLatestNews
};