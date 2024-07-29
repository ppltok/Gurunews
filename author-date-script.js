// author-date-script.js

document.addEventListener('DOMContentLoaded', function() {
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    const articleId = getArticleIdFromUrl();

    fetch('articles.json')
        .then(response => response.json())
        .then(data => {
            const article = data.articles.find(a => a.id === articleId);
            if (article) {
                const authorElement = document.getElementById('articleAuthor');
                authorElement.innerHTML = `<strong>By:</strong> ${article.author}`;

                const dateElement = document.getElementById('articleDate');
                dateElement.innerHTML = `<strong>Published:</strong> ${formatDate(article.publicationDate)}`;
            }
        })
        .catch(error => console.error('Error fetching article data:', error));
});