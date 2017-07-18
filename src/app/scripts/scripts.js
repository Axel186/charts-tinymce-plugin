'use strict';

const types = {
  bar: 'Bar',
  line: 'Line',
  lineWithArea: 'Line with area',
  pie: 'Pie'
};

window.chartsData = {};

if (top.tinymce.activeEditor.windowManager.getParams().chartsData) {
  window.chartsData = JSON.parse(top.tinymce.activeEditor.windowManager.getParams().chartsData);
}

angular.module('app', []).controller('MainCtrl', function () {
  this.types = types;

  this.grid = window.chartsData.grid || {
      width: '400',
      height: '200',
      type: Object.keys(this.types)[0],
      low: 0
    };

  this.labels = window.chartsData.labels || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  this.series = window.chartsData.series || [{
      name: "Test",
      data: [1, 2, 3, 4, 5]
    }];

  this.selectedSerie = {};

  this.selectSerie = function (chart) {
    this.showSettings = false;
    this.showLabels = false;

    this.selectedSerie = chart;
  };

  this.showLabelsScreen = function () {
    this.selectedSerie = {};

    this.showSettings = false;
    this.showLabels = true;
  };

  this.showSettingsScreen = function () {
    this.selectedSerie = {};

    this.showLabels = false;
    this.showSettings = true;
  };

  this.addLabel = function () {
    this.labels.push('');
  };

  this.addSerie = function () {
    this.series.push({
      name: 'new',
      data: []
    });
  };

  this.submit = function () {
    document.getElementById("previewsvg").setAttribute("width", this.grid.width);
    document.getElementById("previewsvg").setAttribute("height", this.grid.height);
    document.getElementById("previewsvg").style.width = this.grid.width + 'px';
    document.getElementById("previewsvg").style.height = this.grid.height + 'px';

    this.saveChartsData();

    const series = this.series.map((chart, index) => {
      return this.series[index].data.slice(0, this.labels.length).map(value => parseInt(value));
    });

    const data = {
      labels: this.labels,
      series: series
    };

    const options = {};

    if (this.grid.metricNameY) {
      const metricNameY = this.grid.metricNameY;
      options.axisY = {
        labelInterpolationFnc: function (value) {
          return value + ' ' + metricNameY;
        }
      };
    }

    if (this.grid.low) {
      options.low = parseInt(this.grid.low);
    }

    if (this.grid.high) {
      options.high = parseInt(this.grid.high);
    }

    if (this.grid.type === 'bar') {
      options.seriesBarDistance = 10;

      new Chartist.Bar('.ct-chart', data, options);
    } else if (this.grid.type === 'pie') {
      data = {series: series[0]};

      new Chartist.Pie('.ct-chart', data);
    } else if (this.grid.type === 'lineWithArea') {
      options.showArea = true;

      new Chartist.Line('.ct-chart', data, options);
    } else {
      new Chartist.Line('.ct-chart', data, options);
    }
  };

  this.saveChartsData = function () {
    window.chartsData = JSON.stringify({
      labels: this.labels,
      series: this.series,
      grid: this.grid
    });
  };

  this.removeLabel = function (i) {
    this.labels.splice(i, 1);
  };

  this.removeSerie = function () {
    const con = confirm("Are you sure?");

    if (con) {
      const index = this.series.indexOf(this.selectedSerie);
      this.series.splice(index, 1);

      this.selectSerie(this.series[0]);
    }
  };

  this.selectSerie(this.series[0]);

  setTimeout(() => {
    this.submit();
  }, 100);

  document.getElementById('main').style.visibility = 'visible';
});
