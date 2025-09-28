
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

const getLatestNews = async (country = 'us') => {
    try {
        const response = await fetch(
            `https://newsdata.io/api/1/latest?apikey=${process.env.NEXT_PUBLIC_NEWSDATA_API_KEY}&country=${country}&prioritydomain=top`,
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