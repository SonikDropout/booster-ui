const { derived, writable } = require('svelte/store');
const { getNested } = require('./helpers');

class Translator {
  /**
   * Constructs object used for storing and retrieving string translations
   * @constructor
   */
  constructor() {
    this.dictionary = {};
    this.loaders = {};
    this.lng = '';
    this.fallbackLocale = 'en';
    this.locale = writable(this.lng);
    this.isLoading = writable(false);
    this.__ = derived(this.locale, () => this._translate.bind(this));
  }
  /**
   * Add translations to internal dictionary
   * @param {string} lng - locale identifier
   * @param {object} dic - objected containing translations
   */
  addMessages(lng, dic) {
    if (!this.dictionary[lng]) this.dictionary[lng] = {};
    Object.assign(this.dictionary[lng], dic);
  }
  /**
   * Registers async locale loader
   * @param {string} lng - locale identifier
   * @param {function} loader - async translation loader
   */
  register(lng, loader) {
    this.loaders[lng] = loader;
  }
  /**
   * Sets locale to use for retrieving translations from internal dictionary
   * Throws error if no translations loaded and no loaders registered for this locale
   * @async
   * @param {string} lng - locale identifier
   */
  async setLocale(lng) {
    if (!this._doesLocaleExist(lng)) {
      if (!this._doesLocaleExist(this.fallbackLocale)) {
        throw new Error(
          `No translations found for ${lng} and ${this.fallbackLocale}!`
        );
      } else {
        lng = this.fallbackLocale;
      }
    }
    if (this.loaders[lng]) {
      this.isLoading.set(true);
      this.addMessages(lng, await this.loaders[lng]());
      this.isLoading.set(false);
    }
    this.lng = lng;
    this.locale.set(lng);
  }
  _translate(key) {
    try {
      return getNested(this.dictionary[this.lng], key) || key;
    } catch {
      throw new Error(
        `Can't find translation for ${this.lng} locale in ${this.dictionary}`
      );
    }
  }
  _doesLocaleExist(lng) {
    return this.dictionary[lng] || this.loaders[lng];
  }
}

const translator = new Translator();

translator.register('ru', () => import('../../locale/ru.json'));
translator.register('en', () => import('../../locale/en.json'));
translator.setLocale(navigator.language.slice(0, 2));

module.exports = translator;
