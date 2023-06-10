
const getRecent = async () => {
    try {
        const response = await fetch(
            'https://videogames-news2.p.rapidapi.com/videogames_news/recent',
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_VIDEO_GAME_NEWS_RAPID_API_KEY,
                    'X-RapidAPI-Host': process.env.NEXT_PUBLIC_VIDEO_GAME_NEWS_RAPID_API_HOST
                }
            }
        );

        return await response.json();
    } catch (error) {
        console.log(error);
    }
};

export {
    getRecent
};