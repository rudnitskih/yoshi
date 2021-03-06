'use strict';
const {inTeamCity, isProduction} = require('../lib/utils');

const productionPattern = `[hash:base64:5]`;
const devPattern = `[path][name]__[local]__${productionPattern}`;

const isTestEnv = process.env.NODE_ENV === 'test';

module.exports = (!isTestEnv && (inTeamCity() || isProduction())) ? productionPattern : devPattern;
