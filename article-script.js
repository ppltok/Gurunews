function getArticleIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log('Retrieved article ID from URL:', id);
    return id;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    const articleId = getArticleIdFromUrl();
    console.log('Article ID:', articleId);

    fetch('articles.json')
        .then(response => response.json())
        .then(data => {
            console.log('Articles data:', data);
            const article = data.articles.find(a => a.id === articleId);
            console.log('Found article:', article);

            if (article) {
                document.title = `Vivido.vip - ${article.title}`;
                document.querySelector('h1').textContent = article.title;
                document.querySelector('.hero-description').textContent = article.description;

                const relatedSearchesContainer = document.querySelector('.related-searches');
                if (relatedSearchesContainer) {
                    console.log('Generating related searches links');
                    article.relatedSearches.forEach(search => {
                        try {
                            console.log('Creating link for:', search);
                            const div = document.createElement('div');
                            div.className = 'hyperlink-container';
                            const link = document.createElement('a');
                            link.href = `https://www.searchhelper.net/serp?q=${encodeURIComponent(search)}&segment=shelp1&agyagid=1000&utm_source=google&gclid={gclid}`;
                            link.textContent = search;
                            console.log('Generated link:', link.href);
                            div.appendChild(link);
                            relatedSearchesContainer.appendChild(div);
                        } catch (error) {
                            console.error('Error creating link for:', search, error);
                        }
                    });
                } else {
                    console.error('Related searches container not found');
                }

                const extendedArticle = document.getElementById('extendedArticle');
                if (extendedArticle) {
                    extendedArticle.innerHTML = `<p>${article.fullContent}</p>`;
                } else {
                    console.error('Extended article container not found');
                }
            } else {
                console.error('Article not found');
                // You could add code here to display an error message to the user
            }
        })
        .catch(error => console.error('Error fetching or parsing articles:', error));

    const readMoreBtn = document.getElementById('readMoreBtn');
    const extendedArticle = document.getElementById('extendedArticle');

    if (readMoreBtn && extendedArticle) {
        readMoreBtn.addEventListener('click', function() {
            console.log('Read More button clicked');
            if (extendedArticle.style.display === 'none') {
                extendedArticle.style.display = 'block';
                readMoreBtn.textContent = 'Show Less';
            } else {
                extendedArticle.style.display = 'none';
                readMoreBtn.textContent = 'Read More';
            }
        });
    } else {
        console.error('Read More button or Extended Article container not found');
    }
});