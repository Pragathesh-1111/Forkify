import View from './view.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');
  _numPages;
  _curPage;
  
  _generateMarkup() {
    this._numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage,
    );
    this._curPage = this._data.page;

    if (this._curPage === 1 && this._numPages > 1) {
      return this._generateMarkupNextButton();
    }
    if (this._curPage < this._numPages) {
      return `${this._generateMarkupPrevButton()}${this._generateMarkupNextButton()}`
    }

    if (this._curPage === this._numPages && this._numPages > 1) {
      return this._generateMarkupPrevButton();
    }

    return '';
  }

  _generateMarkupNextButton() {
    return `
          <button data-goto="${this._curPage + 1}" class="btn--inline pagination__btn--next">
            <span>Page ${this._curPage + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button>
        `;
  }
  _generateMarkupPrevButton() {
    return `
            <button data-goto="${this._curPage - 1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${this._curPage - 1}</span>
          </button>
  `;
  }

  addHandlerClick(handler){
    this._parentElement.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn--inline')
      if(!btn) return;

      const gotoPage = +btn.dataset.goto
      handler(gotoPage)
    })
  }
}

export default new PaginationView();
