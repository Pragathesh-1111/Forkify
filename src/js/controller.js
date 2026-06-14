'use strict';

import * as model from './model.js';
import { MODEL_CLOSE_SEC } from './config.js';
import searchView from './views/searchView.js';
import recipeView from './views/recipeView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import AddReceipeView from './views/addReceipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import addReceipeView from './views/addReceipeView.js';

// if(module.hot){
//   module.hot.accept()
// }

// Controller Function
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to make selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Update Bookmark View
    bookmarkView.update(model.state.bookmarks);

    // 1.Loading recipe
    await model.loadRecipe(id);

    // 2. Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError(err);
  }
};

const controlSearchResults = async function () {
  try {
    // 1) Get query
    const query = searchView.getQuery();
    if (!query) resultsView.renderMessage();
    resultsView.renderSpinner();

    // 2) Get query results
    await model.loadSearchResults(query);

    // 3) Render query results
    resultsView.render(model.getSearchResultsPage());

    // 4) Render Pagination Buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlServings = function (newServings) {
  // Update the model
  model.updateServings(newServings);
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlPagination = function (gotoPage) {
  resultsView.render(model.getSearchResultsPage(gotoPage));
  paginationView.render(model.state.search);
};

const controlAddBookmark = function () {
  // Add/Remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // Update receipe view
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarkView.render(model.state.bookmarks);
};

const controlBookmark = function () {
  bookmarkView.render(model.state.bookmarks);
};

const controlAddReceipe = async function (newReceipe) {
  try {
    // Load spinner
    addReceipeView.renderSpinner()

    // Upload
    await model.uploadReceipe(newReceipe);
    console.log(model.state.recipe);

    // Render receipe view
    recipeView.render(model.state.recipe);

    // Success message
    addReceipeView.renderMessage();

    // Render bookmark view
    bookmarkView.render(model.state.bookmarks)

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    // Close form window
    setTimeout(() => {
      addReceipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    addReceipeView.renderError(err);
    console.log(err);
  }
};

const init = function () {
  bookmarkView.addHandlerBookmark(controlBookmark);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addReceipeView.addHandlerUpload(controlAddReceipe);
};
init();
