const fs = require('fs');
const settings = require('../../settings.json');
const translations = require(`../../locale/${settings.locale || 'ru'}.json`);

module.exports = {
  translations,
  init({ win }) {
    this.windowRef = win;
  },
  changeLocale(newLocale) {
    settings.locale = newLocale;
    fs.writeFile(
      '../../settings.json',
      JSON.stringify(settings),
      Function.prototype
    );
    this.translations = require(`../../locale/${newLocale}.json`);
    if (this.windowRef) this.windowRef.reload();
  },
  t(key) {
    return (
      key.split('.').reduce((tr, k) => tr[k] || {}, this.translations) ||
      'no translation'
    );
  },
};
