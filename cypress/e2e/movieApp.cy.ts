interface IMovie {
  Title: string;
  imdbID: string;
  Type: string;
  Poster: string;
  Year: string;
}

describe('#Movie App', () => {
  let searchText: string;
  let moviesMock: IMovie[];

  beforeEach(() => {
    moviesMock = [
      {
        Title: 'Alien',
        imdbID: '1',
        Type: 'horror',
        Poster: '/image1.webp',
        Year: '1988',
      },
      {
        Title: 'Batman',
        imdbID: '2',
        Type: 'action',
        Poster: '/image1.webp',
        Year: '1988',
      },

      {
        Title: 'Cabin Fever',
        imdbID: '3',
        Type: 'horror',
        Poster: '/image2.webp',
        Year: '2000',
      },
      {
        Title: 'Batman',
        imdbID: '4',
        Type: 'action',
        Poster: '/image1.webp',
        Year: '1988',
      },
    ];

    searchText = 'Batman';

    cy.visit('http://localhost:5173');
  });

  it('passes', () => {
    cy.visit('http://localhost:5173');
  });

  it('should find url', () => {
    cy.intercept(`http://omdbapi.com/?apikey=416ed51a&s=${searchText}`, {
      body: { Search: moviesMock },
    }).as('fetchMovies');

    cy.visit('http://localhost:5173');

    cy.get('input#searchText').type(searchText);
    cy.get('form#searchForm').submit();

    cy.wait('@fetchMovies');

    cy.get('div#movie-container > div.movie').should(
      'have.length',
      moviesMock.length
    );
  });
});
