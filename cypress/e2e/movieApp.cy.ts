interface IMovie {
  Title: string;
  imdbID: string;
  Type: string;
  Poster: string;
  Year: string;
}

const API_URL = 'http://omdbapi.com/?apikey=416ed51a&s=';
let searchText: string;
let moviesMock: IMovie[];
let sortedAscendingMovies: string[];
let sortedDescendingMovies: string[];

const interceptMovies = (statusCode = 200, body = { Search: moviesMock }) => {
  cy.intercept(`${API_URL}${searchText}`, { statusCode, body }).as(
    'fetchMovies'
  );
};

const searchForMovies = () => {
  cy.get('input#searchText').type(searchText);
  cy.get('form#searchForm').submit();
  cy.wait('@fetchMovies');
};

const shouldDisplayErrorMessage = () => {
  cy.get('div#movie-container > div.movie').should('have.length', 0);
  cy.get('div#movie-container > p')
    .should('have.length', 1)
    .and('have.text', 'Inga sökresultat att visa');
};

const headingElementsShouldHaveCorrectTextContent = (movies: IMovie[]) => {
  cy.get('div#movie-container > div.movie').each((movieElement, index) => {
    cy.wrap(movieElement)
      .find('h3')
      .should('have.text', moviesMock[index].Title);
  });
};

const imageElementsAttributesShouldBeFromMovies = (movies: IMovie[]) => {
  cy.get('div#movie-container > div.movie').each((movieElement, index) => {
    cy.wrap(movieElement)
      .find('img')
      .should('have.attr', 'src', movies[index].Poster)
      .and('attr', 'alt', movies[index].Title);
  });
};

describe('#Movie App - Real', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    searchText = 'Sagan om Ringen';
  });

  it('if search text is Sagan om Ringen it should return correct statuscode and body attributes', () => {
    cy.request('GET', `${API_URL}${searchText}`).should((response) => {
      const firstMovie = response.body.Search[0];
      expect(response.status).to.equal(200);
      expect(response.body.Search).length(1);
      expect(firstMovie.Title).to.equal('Sagan om ringen');
      // Testar första egenskapen vet inte om det är nödvändigt att testa alla
      expect(firstMovie).to.have.property('Year').that.is.a('string');
    });
  });

  it('if input is empty it should respond with error', () => {
    searchText = '';
    cy.request('GET', `${API_URL}${searchText}`).should((response) => {
      expect(response.body.Search).undefined;
      expect(response.body).to.not.have.property('Search');
      expect(response.body.Response).to.equal('False');
    });
  });

  it('if input does not represent any movies respond with error', () => {
    searchText = 'dwqdwq';
    cy.request('GET', `${API_URL}${searchText}`).should((response) => {
      expect(response.body.Search).undefined;
      expect(response.body).to.not.have.property('Search');
      expect(response.body.Response).to.equal('False');
    });
  });
});

describe('#Movie App - Mocks', () => {
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

    sortedAscendingMovies = ['Alien', 'Batman', 'Batman', 'Cabin Fever'];
    sortedDescendingMovies = ['Cabin Fever', 'Batman', 'Batman', 'Alien'];
    searchText = 'Batman';
    cy.visit('http://localhost:5173');
  });

  it('if response is ok and user have text in input it should display movies from the mock', () => {
    interceptMovies();
    searchForMovies();

    cy.get('div#movie-container > div.movie').should(
      'have.length',
      moviesMock.length
    );

    headingElementsShouldHaveCorrectTextContent(moviesMock);
    imageElementsAttributesShouldBeFromMovies(moviesMock);
  });

  it('when response is not ok, user should see an error message', () => {
    interceptMovies(500);
    searchForMovies();
    shouldDisplayErrorMessage();
  });

  it('when the movies array are empty, user should see an error message', () => {
    interceptMovies(200, { Search: [] });
    searchForMovies();
    shouldDisplayErrorMessage();
  });

  it('checks if the url contains searchText when form is submitted', () => {
    interceptMovies();

    cy.get('input#searchText').type(searchText);
    cy.get('form#searchForm').submit();

    cy.wait('@fetchMovies').its('request.url').should('contain', searchText);
  });

  it('should have movies sorted based on clicking on ascending or descending buttons', () => {
    interceptMovies();
    searchForMovies();

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
