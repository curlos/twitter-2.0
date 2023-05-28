
const getRecent = async () => {
    try {
        const response = await fetch(
            'https://videogames-news2.p.rapidapi.com/videogames_news/recent',
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': '7b5c381447mshbd5800218d682e4p13654ejsnb9e8c218cf2f',
                    'X-RapidAPI-Host': 'videogames-news2.p.rapidapi.com'
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