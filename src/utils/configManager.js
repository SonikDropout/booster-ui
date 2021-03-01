const path = require('path');
const fs = require('fs');
const { CONFIG_PATH } = require('../constants');

const writeJSON = (path, content) =>
  fs.writeFile(path, JSON.stringify(content, null, 2), {}, Function.prototype);

const startParamsPath = path.join(CONFIG_PATH, 'initialize.json');
const startParams = require(startParamsPath);

exports.getStartParams = () => startParams;

exports.updateStartParams = function updateStartParams(_, newParams) {
  for (let key in newParams) startParams[key] = newParams[key];
  writeJSON(startParamsPath, startParams);
};

const settingsPath = path.join(CONFIG_PATH, 'settings.json');
const settings = require(settingsPath);

exports.getSettings = () => settings;

exports.updateSettings = function updateSettings(_, newSettings) {
  for (let key in newSettings) settings[key] = newSettings[key];
  writeJSON(settingsPath, settings);
};

const algorithmPath = path.join(CONFIG_PATH, 'algorithm.json');

exports.updateAlgorithm = function updateAlgorithm(_, newAlgorithm) {
  writeJSON(algorithmPath, newAlgorithm);
}