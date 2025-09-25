
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

export {
    getTopHeadlines
};