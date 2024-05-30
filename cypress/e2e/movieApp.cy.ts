import { IMovie } from '@/ts/models/Movie';
import { moviesMock } from '@/ts/__mocks__/moviesMock';

const API_URL = 'http://omdbapi.com/?apikey=416ed51a&s=';
const BASE_URL = 'http://localhost:5173';
let searchText: string;
let sortedAscendingMovies: string[];
let sortedDescendingMovies: string[];
let movies: IMovie[];
let alias: string;

const interceptMovies = (statusCode = 200, body = { Search: moviesMock }) => {
  cy.intercept(`${API_URL}${searchText}`, { statusCode, body }).as(
    'fetchMovies'
  );
};

const searchForMovies = () => {
  cy.get('input#searchText').type(searchText);
  cy.get('form#searchForm').submit();
};

const waitForAlias = (alias: string) => {
  cy.wait(alias);
};

const shouldDisplayErrorMessage = () => {
  cy.get('div#movie-container > div.movie').should('have.length', 0);
  cy.get('div#movie-container > p')
    .should('have.length', 1)
    .and('have.text', 'Inga sökresultat att visa');
};

const headingElementsShouldHaveCorrectText = (movies: IMovie[]) => {
  cy.get('div#movie-container > div.movie').each((movieElement, index) => {
    cy.wrap(movieElement).find('h3').should('have.text', movies[index].Title);
  });
};

const imageElementCorrectAttributes = (movies: IMovie[]) => {
  cy.get('div#movie-container > div.movie').each((movieElement, index) => {
    cy.wrap(movieElement)
      .find('img')
      .should('have.attr', 'src', movies[index].Poster)
      .and('attr', 'alt', movies[index].Title);
  });
};

const apiResponseFalse = (response: Cypress.Response<any>) => {
  expect(response.body.Search).undefined;
  expect(response.body).to.not.have.property('Search');
  expect(response.body.Response).to.equal('False');
};

describe('#Movie App - Real', () => {
  beforeEach(() => {
    cy.visit(BASE_URL);
    searchText = 'Sagan om Ringen';
  });

  it('based on non-empty user input show movies', () => {
    cy.request('GET', `${API_URL}${searchText}`).then((response) => {
      movies = response.body.Search;
      const firstMovie = response.body.Search[0];
      expect(response.status).to.equal(200);
      expect(response.body.Search).length(1);
      expect(firstMovie.Title).to.equal('Sagan om ringen');
      // Testar första egenskapen vet inte om det är nödvändigt att testa alla
      expect(firstMovie).to.have.property('Year').that.is.a('string');
      searchForMovies();
      headingElementsShouldHaveCorrectText(movies);
      imageElementCorrectAttributes(movies);
      cy.get('div#movie-container > div.movie').should(
        'have.length',
        movies.length
      );
    });
  });

  it('if input is empty it should respond with error', () => {
    searchText = '';
    cy.request('GET', `${API_URL}${searchText}`).then((response) => {
      apiResponseFalse(response);
      expect(response.body.Error).to.equal('Incorrect IMDb ID.');
      cy.get('form#searchForm').submit();
      shouldDisplayErrorMessage();
    });
  });

  it('if input does not represent any movies respond with error', () => {
    searchText = 'dwqdwq';
    cy.request('GET', `${API_URL}${searchText}`).then((response) => {
      apiResponseFalse(response);
      expect(response.body.Error).to.equal('Movie not found!');
      searchForMovies();
      shouldDisplayErrorMessage();
    });
  });
});

describe('#Movie App - Mocks', () => {
  beforeEach(() => {
    sortedAscendingMovies = ['Alien', 'Batman', 'Batman', 'Cabin Fever'];
    sortedDescendingMovies = ['Cabin Fever', 'Batman', 'Batman', 'Alien'];
    searchText = 'Batman';
    alias = '@fetchMovies';
    cy.visit('http://localhost:5173');
  });

  it('if response is ok and user have text in input it should display movies from the mock', () => {
    interceptMovies();
    searchForMovies();
    waitForAlias(alias);

    cy.get('div#movie-container > div.movie').should(
      'have.length',
      moviesMock.length
    );

    headingElementsShouldHaveCorrectText(moviesMock);
    imageElementCorrectAttributes(moviesMock);
  });

  it('when response is server error, user should see an error message', () => {
    interceptMovies(500);
    searchForMovies();
    waitForAlias(alias);
    shouldDisplayErrorMessage();
  });

  it('for empty movies array, display error message', () => {
    interceptMovies(200, { Search: [] });
    searchForMovies();
    waitForAlias(alias);
    shouldDisplayErrorMessage();
  });

  it('with empty input, display error message', () => {
    searchText = '';
    interceptMovies(200, { Search: [] });
    cy.get('form#searchForm').submit();
    waitForAlias(alias);
    shouldDisplayErrorMessage();
  });

  it('checks if the url contains searchText when form is submitted', () => {
    interceptMovies();
    searchForMovies();
    cy.wait(alias).its('request.url').should('contain', searchText);
  });

  it('should sort movies either descending or ascending', () => {
    interceptMovies();
    searchForMovies();
    waitForAlias(alias);
    cy.get('button#sortAscButton').click();

    /**
     * Check for ascending order
     */
    cy.get('div#movie-container > div.movie').each((movieElement, index) => {
      cy.wrap(movieElement).should('have.text', sortedDescendingMovies[index]);
    });

    cy.get('button#sortDescButton').click();

    /**
     * Check for descending order order
     */
    cy.get('div#movie-container > div.movie').each((movieElement, index) => {
      cy.wrap(movieElement).should('have.text', sortedAscendingMovies[index]);
    });
  });
});
