document.addEventListener('DOMContentLoaded', function() {
    const readMoreBtn = document.getElementById('readMoreBtn');
    const extendedArticle = document.getElementById('extendedArticle');

    readMoreBtn.addEventListener('click', function() {
        if (extendedArticle.style.display === 'none') {
            extendedArticle.style.display = 'block';
            readMoreBtn.textContent = 'Show Less';
        } else {
            extendedArticle.style.display = 'none';
            readMoreBtn.textContent = 'Read More';
        }
    });
});