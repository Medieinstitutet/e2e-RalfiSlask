import { IMovie } from './models/Movie';
import { getData } from './services/movieService';
import { movieSort } from './functions';

let movies: IMovie[] = [];

export const init = () => {
  let form = document.getElementById('searchForm') as HTMLFormElement;

  let sortAscendingButton = document.getElementById(
    'sortAscButton'
  ) as HTMLButtonElement;
  let sortDescendingButton = document.getElementById(
    'sortDescButton'
  ) as HTMLButtonElement;

  form.addEventListener('submit', (e: SubmitEvent) => {
    e.preventDefault();
    handleSubmit();
  });

  sortAscendingButton?.addEventListener('click', (): void => {
    movies = movieSort(movies, false);
    displaySortedMovies(movies);
  });
  sortDescendingButton?.addEventListener('click', (): void => {
    movies = movieSort(movies);
    displaySortedMovies(movies);
  });
};

const displaySortedMovies = (movies: IMovie[]) => {
  const container = document.getElementById(
    'movie-container'
  ) as HTMLDivElement;
  container.innerHTML = '';

  createHtml(movies, container);
};

export async function handleSubmit() {
  let searchText = (document.getElementById('searchText') as HTMLInputElement)
    .value;

  let container: HTMLDivElement = document.getElementById(
    'movie-container'
  ) as HTMLDivElement;
  container.innerHTML = '';

  try {
    movies = await getData(searchText);

    if (movies.length > 0) {
      createHtml(movies, container);
    } else {
      displayNoResult(container);
    }
  } catch {
    displayNoResult(container);
  }
}

export const createHtml = (movies: IMovie[], container: HTMLDivElement) => {
  for (let i = 0; i < movies.length; i++) {
    let movie = document.createElement('div');
    let title = document.createElement('h3');
    let img = document.createElement('img');

    movie.classList.add('movie');
    title.innerHTML = movies[i].Title;
    img.src = movies[i].Poster;
    img.alt = movies[i].Title;

    movie.appendChild(title);
    movie.appendChild(img);

    container.appendChild(movie);
  }
};

export const displayNoResult = (container: HTMLDivElement) => {
  let noMessage = document.createElement('p');

  noMessage.innerHTML = 'Inga sökresultat att visa';

  container.appendChild(noMessage);
};
