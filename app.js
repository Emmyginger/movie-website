// ------- OOP CLASSES --------

class Movie {
  #userRating; // private field for user rating

  constructor({ title, year, genre, poster, plot }) {
    this.title = title;
    this.year = year;
    this.genre = genre;
    this.poster = poster || '';
    this.plot = plot || '';
    this.reviews = [];
    this.#userRating = null;
  }
  addReview(review) {
    this.reviews.push(review);
  }
  setUserRating(rating) {
    this.#userRating = rating;
  }
  getUserRating() {
    return this.#userRating ?? 'N/A';
  }
  display() {
    return `
      <div class="movie-card other">
        <img src="${this.poster}" alt="Poster">
        <div class="movie-title">${this.title} <span style="float:right;">⭐ ${this.getUserRating()}</span></div>
        <div class="movie-meta"><b>Year:</b> ${this.year} <br><b>Genre:</b> ${this.genre}</div>
        <div class="movie-meta">${this.plot}</div>
      </div>`;
  }
}

class ActionMovie extends Movie {
  display() {
    return `
      <div class="movie-card action">
        <img src="${this.poster}" alt="Poster">
        <div class="movie-title">${this.title} <span style="float:right;">💥</span></div>
        <div class="movie-meta"><span style="color:#e74c3c"><b>Action Movie</b></span><br>
        <b>Year:</b> ${this.year} | <b>⭐</b> ${this.getUserRating()}</div>
        <div class="movie-meta">${this.plot}</div>
      </div>`;
  }
}
class ComedyMovie extends Movie {
  display() {
    return `
      <div class="movie-card comedy">
        <img src="${this.poster }" alt="Poster">
        <div class="movie-title">${this.title} <span style="float:right;">😂</span></div>
        <div class="movie-meta"><span style="color:#f1c40f"><b>Comedy Movie</b></span><br>
        <b>Year:</b> ${this.year} | <b>⭐</b> ${this.getUserRating()}</div>
        <div class="movie-meta">${this.plot}</div>
      </div>`;
  }
}

class RomanceMovie extends Movie {
  display() {
    return `
      <div class="movie-card romance">
        <img src="${this.poster }" alt="Poster">
        <div class="movie-title">${this.title} <span style="float:right;">💖</span></div>
        <div class="movie-meta"><span style="color:#e170b4"><b>Romance Movie</b></span><br>
        <b>Year:</b> ${this.year} | <b>⭐</b> ${this.getUserRating()}</div>
        <div class="movie-meta">${this.plot}</div>
      </div>`;
  }
}

class User {
  constructor(name) {
    this.name = name;
    this.collection = [];
  }
  addMovie(movie) {
    this.collection.push(movie);
  }
  getMovies() {
    return this.collection;
  }
}

class Review {
  constructor(username, text) {
    this.username = username;
    this.text = text;
    this.date = new Date();
  }
  display() {
    return `<div class="review"><b>${this.username}:</b> ${this.text} <span style="float:right; font-size:0.85em">[${this.date.toLocaleDateString()}]</span></div>`;
  }
}

// ------- APP LOGIC ---------

const OMDB_API_KEY = `f038945a`; 
const OMDB_BASE = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=`;

const user = new User('MovieFan');

// Utility: Create Movie instance based on genre
function createMovieFromData(data, genre) {
  const params = {
    title: data.Title,
    year: data.Year,
    genre: data.Genre,
    poster: data.Poster,
    plot: data.Plot
  };
  if (genre === 'Action') return new ActionMovie(params);
  if (genre === 'Comedy') return new ComedyMovie(params);
  if (genre === 'Romance') return new RomanceMovie(params);
  else return new Movie(params);
}

// Rendering
function renderMovies() {
  const container = document.getElementById('movies-container');
  container.innerHTML = '';
  user.getMovies().forEach((movie, idx) => {
    // Add reviews & rating controls per movie
    let html = movie.display();
    html = html.replace('</div>', `
      <div class="reviews" id="reviews-${idx}">
        <b>Reviews:</b>
        ${movie.reviews.map(r => r.display()).join('') || '<i>No reviews yet</i>'}
        <form class="add-review-form" data-idx="${idx}">
          <input type="text" name="review" placeholder="Add review..." required>
          <button type="submit">Post</button>
        </form>
      </div>
      <div>
        <span>Rate: </span>
        <select class="rating-select" data-idx="${idx}">
          <option value="">--</option>
          ${[1,2,3,4,5].map(val => `<option value="${val}" ${movie.getUserRating()==val?'selected':''}>${val}</option>`).join('')}
        </select>
      </div>
      <button class="remove-movie-btn" data-idx="${idx}">🗑 Remove</button>
    </div>`);
    container.innerHTML += html;
  });
}

// Add new movie
document.getElementById('add-movie-form').addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('movie-title').value.trim();
  const genre = document.getElementById('movie-genre').value;
  if (!title) return alert('Please enter a title!');
  let res = await fetch(OMDB_BASE + encodeURIComponent(title));
  let data = await res.json();
  if (data.Response === 'False') {
    alert('Movie not found on OMDB!');
    return;
  }
  let movie = createMovieFromData(data, genre);
  user.addMovie(movie);
  renderMovies();
  e.target.reset();
});

// Delegate review adding and user ratings
document.getElementById('movies-container').addEventListener('submit', function (e) {
  if(e.target.classList.contains('add-review-form')) {
    e.preventDefault();
    const idx = +e.target.getAttribute('data-idx');
    const mov = user.getMovies()[idx];
    const txt = e.target.review.value.trim();
    mov.addReview(new Review(user.name, txt));
    renderMovies();
  }
});
document.getElementById('movies-container').addEventListener('change', function (e) {
  if(e.target.classList.contains('rating-select')) {
    const idx = +e.target.getAttribute('data-idx');
    const rating = +e.target.value;
    user.getMovies()[idx].setUserRating(rating);
    renderMovies();
  }
});

// Remove a single movie by index
document.getElementById('movies-container').addEventListener('click', function(e) {
  if (e.target.classList.contains('remove-movie-btn')) {
    const idx = +e.target.getAttribute('data-idx');
    user.collection.splice(idx, 1);
    renderMovies();
  }
});

// Clear all movies
document.getElementById('clear-all-movies').addEventListener('click', function() {
  if (confirm('Delete your entire movie collection?')) {
    user.collection = [];
    renderMovies();
  }
});

// Initial render (empty)
renderMovies();