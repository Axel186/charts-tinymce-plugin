'use strict';

var $ = require('jquery');
const uuid = require("uuid");

module.exports = {
  /**
   * Send request to server to get credentials for uploading image.
   * @param  {String} name  Name of the file that we wants to upload.
   * @param  {String} type  Mime type of file - image/png, text/html...
   * @return {Promise}      Promise object - we can continue with "then" methood.
   */
  getCredentials: function (name, type) {
    return $.ajax({
      url: window.S3Config.s3_credentials_url + "getPolicy",
      type: 'GET',
      dataType: 'json',
      data: {
        filename: name,
        content_type: type
      }
    });
  },

  /**
   * XHR - POST request for uploading the file to S3.
   * @param  {Strin}    url       URL path - where to send request.
   * @param  {Object}   params    Object of required parameter (credentials) for
   *                              uploading.
   * @param  {Function} callback  Call to execute after successfull request.
   */
  sendFile: function (url, params, callback, uploadProgress) {
    var self = this;
    var fd = new FormData();
    Object.keys(params).forEach(function (key) {
      fd.append(key, params[key]);
    })

    var xhr = new XMLHttpRequest();
    uploadProgress = uploadProgress || self.uploadProgress;

    xhr.upload.addEventListener("progress", uploadProgress, false);
    xhr.addEventListener("load", function (response_s3) {
      var response = {
        status: true
      };

      try {
        response.image = response_s3.target.responseXML.getElementsByTagName("Location")[0].childNodes[0].nodeValue;
      } catch (e) {
        response.status = false;
        response.description = "Can't upload image, something gone wrong...";
      }

      callback(response);
      self.uploadComplete();
    }, false);
    xhr.addEventListener("error", self.uploadFailed, false);
    xhr.addEventListener("abort", self.uploadCanceled, false);

    xhr.open('POST', url, true); //MUST BE LAST LINE BEFORE YOU SEND

    xhr.send(fd);
  },

  /**
   * Upload file to remote server - S3 AWS.
   * @param  {String} file URI file - as string. base64.
   * @param  {String} path Path of the file to upload. (without domain).
   */
  upload: function (file, path, uploadProgress) {
    var self = this;

    return new Promise(function (resolve, reject) {
      var full_name = path + "/" + uuid() + "." + file.type.split('/')[1];
      // var full_name = path + "/" + uuid() + "." + file.type.split(/[\/+]+/)[1];

      self.getCredentials(full_name, file.type).then(function (res) {
        res.params.file = file;
        res.params.key = full_name;

        self.sendFile(res.endpoint_url, res.params, function (response) {
          resolve(response);
        }, uploadProgress);
      });
    });
  },

  /**
   * Events of uploading.
   */
  uploadProgress: function (e) {
    console.log(e);
    console.log("uploadProgress");
  },
  uploadComplete: function () {
    console.log("uploadComplete");
  },
  uploadFailed: function (e) {
    console.log(e);
    console.log("uploadFailed");
  },
  uploadCanceled: function (e) {
    console.log(e);
    console.log("uploadCanceled");
  }
};
