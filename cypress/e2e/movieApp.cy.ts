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
        Poster: '/image2.webp',
        Year: '1988',
      },

      {
        Title: 'Cabin Fever',
        imdbID: '3',
        Type: 'horror',
        Poster: '/image3.webp',
        Year: '2000',
      },
      {
        Title: 'Batman',
        imdbID: '4',
        Type: 'action',
        Poster: '/image4.webp',
        Year: '1988',
      },
    ];

    searchText = 'Batman';
    cy.visit('http://localhost:5173');
  });

  it('passes', () => {
    cy.visit('http://localhost:5173');
  });

  it('if response is ok and user have text in input it should display movies', () => {
    cy.intercept(`http://omdbapi.com/?apikey=416ed51a&s=${searchText}`, {
      body: { Search: moviesMock },
      statusCode: 200,
    }).as('fetchMovies');

    cy.get('input#searchText').type(searchText);
    cy.get('form#searchForm').submit();

    cy.wait('@fetchMovies');

    cy.get('div#movie-container > div.movie').should(
      'have.length',
      moviesMock.length
    );

    cy.get('div#movie-container > div.movie').each((movieElement, index) => {
      cy.wrap(movieElement)
        .find('h3')
        .should('have.text', moviesMock[index].Title);
    });

    cy.get('div#movie-container > div.movie').each((movieElement, index) => {
      cy.wrap(movieElement)
        .find('img')
        .should('have.attr', 'src', moviesMock[index].Poster)
        .and('attr', 'alt', moviesMock[index].Title);
    });

    it('when response is not ok, user should see an error message', () => {
      cy.intercept(`http://omdbapi.com/?apikey=416ed51a&s=${searchText}`, {
        body: { Search: moviesMock },
        statusCode: 500,
      }).as('fetchMovies');

      cy.get('input#searchText').type(searchText);
      cy.get('form#searchForm').submit();

      cy.wait('@fetchMovies');

      cy.get('div#movie-container > div.movie').should('have.length', 0);
      cy.get('div#movie-container > p')
        .should('have.length', 1)
        .and('have.text', 'Inga sökresultat att visa');
    });

    it('when the movies array are empty, user should see an error message', () => {
      cy.intercept(`http://omdbapi.com/?apikey=416ed51a&s=${searchText}`, {
        body: { Search: [] },
      }).as('fetchMovies');

      cy.get('input#searchText').type(searchText);
      cy.get('form#searchForm').submit();

      cy.wait('@fetchMovies');

      cy.get('div#movie-container > div.movie').should('have.length', 0);
      cy.get('div#movie-container > p')
        .should('have.length', 1)
        .and('have.text', 'Inga sökresultat att visa');
    });

    it('checks if the url contains searchText when form is submitted', () => {
      cy.intercept(`http://omdbapi.com/?apikey=416ed51a&s=${searchText}`, {
        body: { Search: moviesMock },
      }).as('fetchMovies');

      cy.get('input#searchText').type(searchText);
      cy.get('form#searchForm').submit();

      cy.wait('@fetchMovies').its('request.url').should('contain', searchText);
    });
  });
});
