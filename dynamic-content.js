// dynamic-content.js

console.log('dynamic-content.js has been loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM is fully loaded. Starting to fetch articles.');

    const categoryTitle = document.querySelector('.category-header h1').textContent;
    const articleList = document.querySelector('.article-list');

    console.log('Category title:', categoryTitle);

    // Function to normalize strings for comparison
    function normalizeString(str) {
        return str.toLowerCase().replace(/\s+/g, '').replace(/s$/,'');
    }

    fetch('articles.json')
        .then(response => response.json())
        .then(data => {
            console.log('Articles data fetched:', data);

            const normalizedCategoryTitle = normalizeString(categoryTitle.replace(' Articles', ''));
            console.log('Normalized category title:', normalizedCategoryTitle);
            
            const articles = data.articles.filter(article => 
                normalizeString(article.mainTopic) === normalizedCategoryTitle
            );

            console.log('Filtered articles:', articles);

            if (articles.length === 0) {
                console.log('No articles found for category:', normalizedCategoryTitle);
                articleList.innerHTML = '<p>No articles found for this category.</p>';
                return;
            }

            articleList.innerHTML = ''; // Clear any existing content

            articles.forEach(article => {
                const articleCard = document.createElement('div');
                articleCard.className = 'article-card';
                articleCard.innerHTML = `
                    <h3>${article.title}</h3>
                    <p>${article.description}</p>
                    <a href="article.html?id=${article.id}" class="read-more">Read More</a>
                `;
                articleList.appendChild(articleCard);
            });

            console.log('Articles have been added to the page.');
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
            articleList.innerHTML = '<p>Error loading articles. Please try again later.</p>';
        });
});