'use strict';

import * as chartsCss from "./js/charts-css";
const $ = require('jquery');

const elementClassName = "tinymce-chart";

const plugin = (editor, url) => {
  editor.addButton('chartsTinymcePlugin', {
    text: false,
    tooltip: 'Charts',
    image: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHdpZHRoPSIyMDQ4IiBoZWl' +
    'naHQ9IjE3OTIiIHZpZXdCb3g9IjAgMCAyMDQ4IDE3OTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTY0MCA' +
    '4OTZ2NTEyaC0yNTZ2LTUxMmgyNTZ6bTM4NC01MTJ2MTAyNGgtMjU2di0xMDI0aDI1NnptMTAyNCAxMTUydjEyOGgtMjA0OHYtMTUzNmgxMjh2MTQ' +
    'wOGgxOTIwem0tNjQwLTg5NnY3NjhoLTI1NnYtNzY4aDI1NnptMzg0LTM4NHYxMTUyaC0yNTZ2LTExNTJoMjU2eiIvPjwvc3ZnPg==',
    onclick: () => {
      tinymce.activeEditor.schema.addValidElements("img[*],script[type|src],div[*],div[id|style]a[*],altGlyph[*],altGlyphDef" +
        "[*],altGlyphItem[*],animate[*],animateColor[*],animateMotion[*],animateTransform[*],circle[*],clipPath[*],co" +
        "lor-profile[*],cursor[*],defs[*],desc[*],ellipse[*],feBlend[*],feColorMatrix[*],feComponentTransfer[*],feCom" +
        "posite[*],feConvolveMatrix[*],feDiffuseLighting[*],feDisplacementMap[*],feDistantLight[*],feFlood[*],feFuncA" +
        "[*],feFuncB[*],feFuncG[*],feFuncR[*],feGaussianBlur[*],feImage[*],feMerge[*],feMergeNode[*],feMorphology[*]," +
        "feOffset[*],fePointLight[*],feSpecularLighting[*],feSpotLight[*],feTile[*],feTurbulence[*],filter[*],font[*]" +
        ",font-face[*],font-face-format[*],font-face-name[*],font-face-src[*],font-face-uri[*],foreignObject[*],g[*]," +
        "glyph[*],glyphRef[*],hkern[*],image[*],line[*],linearGradient[*],marker[*],mask[*],metadata[*],missing-glyph" +
        "[*],mpath[*],path[*],pattern[*],polygon[*],polyline[*],radialGradient[*],rect[*],script[*],set[*],stop[*],st" +
        "yle[*],svg[*],switch[*],symbol[*],text[*],textPath[*],title[*],tref[*],tspan[*],use[*],view[*],vkern[*]");
      tinymce.activeEditor.schema
      openChartsEditor();
    }
  });

  editor.addCommand('uploadChart', function (file) {
    const insertBtn = $('#insertButton');
    insertBtn.attr('disabled', true);
    insertBtn.addClass('mce-disabled');
    insertBtn.attr('aria-disabled', true);

    const loading_element =
      '<div id="tinymce_upload_progress" style="height: 40px;">' +
      '<p style="padding: 10px 10px; margin: 0px">Uploading, please wait...</p>' +
      '<div style="position: absolute; height: 3px; background-color: black; width: 0%" id="tinymce_upload_progress_bar"></div>' +
      '</div>';

    $('.mce-reset .mce-container-body').first().before(loading_element);

    file.elementClassName = elementClassName;

    editor.settings.chart_uploader(file, function (content) {
      $('#tinymce_upload_progress').remove();

      insertBtn.attr('disabled', false);
      insertBtn.removeClass('mce-disabled');
      insertBtn.attr('aria-disabled', false);

      editor.execCommand('mceInsertContent', false, content);
      editor.windowManager.close();
    });
  });

  editor.on("click", function (e) {
    const t = $(e.target);

    if (!t[0]) {
      return;
    }

    const el = t[0].closest("." + elementClassName);
    if (el && typeof el.className === 'string' && el.className.indexOf(elementClassName) > -1) {
      const chartsData = el.getAttribute("charts-data");
      openChartsEditor(chartsData);
    }
  });

  const openChartsEditor = function (chartsData) {
    // Open window
    const frame = editor.windowManager.open({
      text: false,
      title: 'Charts editor',
      url: url + '/app/index.html',
      width: 800,
      height: 400,

      buttons: [{
        text: 'Insert',
        classes: 'widget btn primary first abs-layout-item',
        disabled: false,
        id: 'insertButton',
        onclick: function () {
          if ($('#insertButton').attr('disabled')) {
            return;
          }

          var iframeEl = window.ChartsEditorFrame.$el.find("iframe")[0];

          // Get SVG Element
          var svgWrapper = iframeEl.contentDocument.getElementById("preview");
          var svgWrapperInner = iframeEl.contentDocument.getElementById("previewsvg");
          var svgElement = svgWrapper.getElementsByTagName("svg")[0];

          // Get size:
          var width = svgWrapperInner.getAttribute('width');
          var height = svgWrapperInner.getAttribute('height');

          svgElement.setAttribute('width', width);
          svgElement.setAttribute('height', height);

          svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          svgElement.setAttribute('style', 'background-color:#fff');

          var source = svgElement.outerHTML;
          var position = source.indexOf("<" + svgElement.firstChild.nodeName);
          source = source.splice(position, 0, chartsCss);

          //convert svg source to URI data scheme.
          var blob = new Blob([source], {type: "image/svg+xml"});

          svgElement.setAttribute('class', 'tinymce-chart noneditable');
          svgElement.setAttribute('chartis-data', iframeEl.contentWindow.chartsData);

          editor.execCommand('uploadChart', {
            html: svgElement.outerHTML,
            blob: blob,
            width: width,
            height: height,
            chartsData: iframeEl.contentWindow.chartsData
          });
        }
      }, {
        text: 'Close',
        onclick: 'close'
      }]
    }, {
      chartsData: chartsData,
      width: 300,
      height: 200
    });

    window.ChartsEditorFrame = frame;
  };
};

export default plugin;

if (!String.prototype.splice) {
  /**
   * {JSDoc}
   *
   * The splice() method changes the content of a string by removing a range of
   * characters and/or adding new characters.
   *
   * @this {String}
   * @param {number} start Index at which to start changing the string.
   * @param {number} delCount An integer indicating the number of old chars to remove.
   * @param {string} newSubStr The String that is spliced in.
   * @return {string} A new string with the spliced substring.
   */
  String.prototype.splice = function (start, delCount, newSubStr) {
    return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
  };
}
