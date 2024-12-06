const apiKey = '854180c799350d51acbe1cdd3295b2bd'; // Your API key
const resultsContainer = document.getElementById('results');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    searchMoviesAndTV(query);
  }
});

searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) {
      searchMoviesAndTV(query);
    }
  }
});

async function searchMoviesAndTV(query) {
  resultsContainer.innerHTML = '';
  const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      let hasResults = false;
      for (let item of data.results) {
        if (item.media_type === 'movie' || item.media_type === 'tv') {
          renderCard(item);
          hasResults = true;
        }
      }
      if (!hasResults) {
        resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
      }
    } else {
      resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    resultsContainer.innerHTML = '<div class="no-results">Error fetching results</div>';
  }
}

async function renderCard(item) {
  const posterPath = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
    : 'https://via.placeholder.com/500x750?text=No+Image';

  const title = item.title || item.name || 'Untitled';
  const overview = item.overview || 'No overview available';
  const mediaType = item.media_type; // 'movie' or 'tv'

  // Fetch additional details for cast & ratings
  let detailsUrl;
  if (mediaType === 'movie') {
    detailsUrl = `https://api.themoviedb.org/3/movie/${item.id}?api_key=${apiKey}&append_to_response=credits`;
  } else if (mediaType === 'tv') {
    detailsUrl = `https://api.themoviedb.org/3/tv/${item.id}?api_key=${apiKey}&append_to_response=credits`;
  }

  let castList = 'N/A';
  let rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

  if (detailsUrl) {
    try {
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();
      if (detailsData.credits && detailsData.credits.cast) {
        const topCast = detailsData.credits.cast.slice(0, 5).map(actor => actor.name);
        castList = topCast.join(', ');
      }
      if (detailsData.vote_average) {
        rating = detailsData.vote_average.toFixed(1);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    }
  }

  const card = document.createElement('div');
  card.classList.add('card');

  card.innerHTML = `
    <img src="${posterPath}" alt="${title} Poster" />
    <div class="card-content">
      <h3>${title}</h3>
      <div class="overview">${overview}</div>
      <div class="meta">
        <span><strong>Type:</strong> ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}</span>
        <span><strong>Rating:</strong> ${rating}</span><br>
        <span><strong>Cast:</strong> ${castList}</span>
      </div>
    </div>
  `;

  resultsContainer.appendChild(card);
}
