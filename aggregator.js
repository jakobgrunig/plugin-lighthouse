'use strict';

const forEach = require('lodash.foreach');
const set = require('lodash.set');

class Aggregator {
  constructor(statsHelpers, log) {
    this.statsHelpers = statsHelpers;
    this.log = log;
    this.stats = {};
  }

  _pushStats(path, value) {
    if (value === undefined || value === null) {
      this.log.debug(`stat ${path} was undefined, skipping`);
      return;
    }
    this.statsHelpers.pushStats(this.stats, path, value);
  }

  addToAggregate(result) {
    forEach(result.categories, category => {
      this._pushStats(['categories', category.id], category.score);
    });

    forEach(result.audits, audit => {
      if (audit.numericValue !== null) {
        this._pushStats(['audits', audit.id + '-value'], audit.numericValue);
      }
      if (audit.score !== null) {
        this._pushStats(['audits', audit.id + '-score'], audit.score);
      }
    });
  }

  summarize() {
    if (Object.keys(this.stats).length === 0) {
      return undefined;
    }
    return this.summarizePerObject(this.stats);
  }

  summarizePerObject(obj) {
    return Object.keys(obj).reduce((summary, name) => {
      const categoryData = {};
      forEach(obj[name], (stats, timingName) => {
        set(
          categoryData,
          timingName,
          this.statsHelpers.summarizeStats(stats, { decimals: 2 })
        );
      });
      summary[name] = categoryData;
      return summary;
    }, {});
  }
}

module.exports = Aggregator;
