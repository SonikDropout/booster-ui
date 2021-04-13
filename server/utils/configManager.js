const path = require('path');
const fs = require('fs');
const { CONFIG_PATH } = require('../globals');

const writeJSON = (path, content) =>
  fs.promises.writeFile(path, JSON.stringify(content, null, 2));

const startParamsPath = path.join(CONFIG_PATH, 'initialize.json');
const startParams = require(startParamsPath);

exports.getStartParams = () => startParams;

exports.updateStartParams = function updateStartParams(newParams) {
  for (let key in newParams) startParams[key] = newParams[key];
  return writeJSON(startParamsPath, startParams);
};

const settingsPath = path.join(CONFIG_PATH, 'settings.json');
const settings = require(settingsPath);

exports.getSettings = () => settings;

exports.updateSettings = function updateSettings(newSettings) {
  for (let key in newSettings) settings[key] = newSettings[key];
  return writeJSON(settingsPath, settings);
};

const algorithmPath = path.join(CONFIG_PATH, 'algorithm.json');

exports.updateAlgorithm = function updateAlgorithm(newAlgorithm) {
  return writeJSON(algorithmPath, newAlgorithm);
};
