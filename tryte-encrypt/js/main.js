var $ = require('jquery');
var trytes = require('trytes');
var trypto = require('tryte-encrypt');
var qrcode = require('qrcode');
var jsQR = require('jsqr');
var IOTA = require('iota.lib.js');
var Logo = require('./logo.js');

const iota = new IOTA({});
const IOTACHAR = "9ABCDEFGHIJKLMNOPQRSTUVWXYZ";

//var seed = 'A999TEST999SEED99999999999999999999999999999999999999999999999999999999999999999Z';
const _cachedAddresses = {};

$(document).ready(function () {
  displaySeed($('.article'), 'A999TEST999SEED99999999999999999999999999999999999999999999999999999999999999999Z', true);

  var logo = new Logo('assets/iota-logo.png', $('canvas.logo')[0]);


  // Event handlers
  $('textarea.seed').on('change input paste', function (e) {
    let text = $(e.target).val();
    displaySeed($(e.target).closest('.article'), text);
  });

  $('button.generate-seed').click(function (e) {
    displaySeed($(e.target).closest('.article'), generateSeed(), true);
  });

  $('button.scan-seed').click(function (e) {
    var $button = $(e.target);
    var $article = $button.closest('.article');
    if ($button.data('type') === 'CANCEL') {
      $('#statusMessage').text("Cancelling video...");
      $button.data('type', 'CANCELING');
    } else {
      $('#statusMessage').text("⌛ Loading video...");
      $button.data('type', 'CANCEL');
      $button.text('Cancel');
      //----------------------
      // SetUp webcam - START
      var video = document.createElement('video');
      var canvas = $(e.target).closest('.article').find('canvas.seed-qr')[0];
      var context = canvas.getContext("2d");
      context.scale(-1, 1);


      // Use facingMode: environment to attemt to get the front camera on phones
      var localStream;
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function (stream) {
        video.srcObject = stream;
        video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        video.play();
        localStream = stream;
        requestAnimationFrame(tick);
        $('#statusMessage').text("Hold a QR code infort of the camera to scan the seed");

      });
      // SetUp webcam - END
      //----------------------

      function tick() {
        //console.log('tick');
        var keepScanning = true;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          //console.log('tack');

          //loadingMessage.hidden = true;
          //canvas.hidden = false;
          //outputContainer.hidden = false;
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          var code = jsQR(imageData.data, imageData.width, imageData.height);

          //if ($button.data('type') == 'CANCELING') {
          // STOP VIDEO
          if ($button.data('type') == 'CANCELING') {
            //console.log('Stops scanning, canceled');
            $button.data('type', 'SCAN');
            $button.text('Scan');
            displaySeed($('.article'));
            keepScanning = false;
          } else if (code && code.data) {
            var seed = parseSeed(code.data);
            if (seed.type == 'PLAIN' || seed.type == 'ENCRYPTED') {
              $button.data('type', 'SCAN');
              $button.text('Scan');
              $('#statusMessage').text('');
              drawRect(context, code.location, "#FF3B58");
              keepScanning = false;
              setTimeout(() => {
                //console.log('SEED');
                _cachedAddresses
                displaySeed($article, code.data, true);
              }, 700);
              //console.log('Stops scanning, found seed');
            }
          }
        }



        if (keepScanning) {
          requestAnimationFrame(tick);
        } else {
          localStream.getTracks().forEach(track => track.stop());
          video.pause();
          video.src = "";
        }
      }
    }
  });

  $('button.encrypt-seed').click(function (e) {
    var $button = $(e.target);
    var $article = $button.closest('.article');
    var seed = $article.find('textarea.seed').val();
    var passphrase = $article.find('textarea.passphrase').val();
    var scryptLevel = parseInt($article.find('select.scrypt-T').val());
    var scryptOptions = { toughness: scryptLevel, interruptStep: 3000 };

    //$('#spinner').addClass('spinner');
    $('canvas.logo').css('animation-iteration-count', 'infinite');
    $('canvas.logo').removeClass('spinner').width();
    $('canvas.logo').addClass('spinner');
    ///var seedTranformed;
    ///logo.spinStart(2000, () => {
    ///  if (seedTranformed)
    ///    displaySeed($article, seedTranformed, true);
    ///});

    var decrypt = $button.data('type') == 'DECRYPT';
    $('#statusMessage').text(decrypt ? 'Decrypting...' : 'Encrypting...');
    setTimeout(function () {
      if (decrypt) {
        trypto.decrypt(seed, passphrase, scryptOptions, function (decrypted) {
          $('#statusMessage').text('');
          if (decrypted.length == 81)
            seedTranformed = decrypted;
          else
            $('#statusMessage').text('Incorrect passphrase (or encryption options)');
          displaySeed($article, decrypted, true);
          $('canvas.logo').css('animation-iteration-count', 1);
          ///logo.spinStop();
        });
      } else {
        trypto.encrypt(seed, passphrase, scryptOptions, function (encrypted) {
          if (_cachedAddresses[seed]) {
            address = _cachedAddresses[seed];
            delete _cachedAddresses[seed];
            _cachedAddresses[encrypted] = address;
          }

          $('#statusMessage').text('');
          displaySeed($article, encrypted, true);
          seedTranformed = encrypted;
          $('canvas.logo').css('animation-iteration-count', 1);
          ///logo.spinStop();
        });
      }
      //$('#spinner').removeClass('spinner');
      //$('canvas.logo').removeClass('spinner');
      //logo.spinStop();
    }, 10);
  });

  // View functions
  function displaySeed(e, seed, updateInputField) {
    if (!seed) {
      seed = $(e).find('textarea.seed').val();
    }
    if (updateInputField) {
      $input = $(e).find('textarea.seed');
      if ($input.length) {
        $input.val(seed);
      }
    }
    let $select = $(e).find('.scrypt-T');
    if (seed.indexOf(':') > -1) {
      let opts = seed.split(':')[1];
      if (opts[0] == 'T' && $select.children("[value='" + opts.substr(1) + "']").length) {
        $select.val(opts[1]);
      } else {
        $select.children(':first').text(opts);
        $select.val('0');
      }
      $select.attr('disabled', 'disabled');
    } else {
      $select.children(':first').text('Standard');
      $select.removeAttr('disabled');
    }



    let $seedTitle = $(e).find('.seedTitle');

    var address = null;
    var seedtype = parseSeed(seed);
    var $butEncrypt = $(e).find('button.encrypt-seed');
    var emptyPassphrase = ($(e).find('textarea.passphrase').val().trim() == '');
    if (seedtype.type == 'ENCRYPTED') {
      $seedTitle.text('Encrypted seed:');
      $butEncrypt.text('Decrypt');
      $butEncrypt.text('Decrypt');
      $butEncrypt.data('type', 'DECRYPT');
      $butEncrypt.prop('disabled', emptyPassphrase);
      address = (_cachedAddresses[seed]) ? _cachedAddresses[seed] : "";

    } else {
      $seedTitle.text('Seed:');
      $butEncrypt.text('Encrypt');
      $butEncrypt.data('type', 'ENCRYPT');
      $butEncrypt.prop('disabled', emptyPassphrase || seedtype.type != 'PLAIN');
      if (seedtype.type == 'PLAIN') {
        if (_cachedAddresses[seed]) {
          address = _cachedAddresses[seed];
        } else {
          address = generateAddress(seed);
          _cachedAddresses[seed] = address;
        }
        $('#statusMessage').text('')
      } else {
        var msg = '';
        if (seedtype.illegal.length)
          msg += seed.length + ' characters';
        if (seedtype.illegal.character)
          msg += 'Illegal character';
        $seedTitle.text('Invalid seed: ' + msg);
        $('#statusMessage').text('Not a valid IOTA seed')
      }
    }


    // Draw Address
    //if (address != null) {
    drawQr($(e).find('canvas.address-qr'), address, 'L');
    drawText($(e).find('canvas.address-text'), address, 7);
    //}

    // Draw Seed
    drawQr($(e).find('canvas.seed-qr'), seed, 'L');
    drawText($(e).find('canvas.seed-text'), seed, 7);
  }


  // ================
  //  Draw functions
  // ================

  function drawQr($canvas, text, correctionLevel) {
    $canvas = $($canvas);
    correctionLevel = correctionLevel || 'L';

    if ($canvas && $canvas.length) {
      var canvas = $canvas[0];
      if (text) {
        qrcode.toCanvas(canvas, text, { version: 4, errorCorrectionLevel: correctionLevel, color: { dark: '#146b64', light: '#FF000000' } });
      } else {
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  function drawText($canvas, text, lines) {
    $canvas = $($canvas);
    lines = lines || 1;
    var fontSize = 12*2;
    var lineHeight = fontSize * 1.3;

    if ($canvas && $canvas.length) {
      var canvas = $canvas[0];
      var context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (text) {
        context.font = 'bold ' + fontSize + "px Tahoma";
        context.fillStyle = '#146b64';

        var textLength = context.measureText(text).width;
        var lineWidth = textLength / lines;
        var lineNo = 0;
        var start = 0;
        for (var i = 1; i <= text.length; i++) {
          var subText = text.slice(start, i);
          var subLineWidth = context.measureText(subText).width;
          if (subLineWidth > lineWidth || i == text.length) {
            start = i;
            var x = 10
            lineNo++;
            var y = lineHeight * lineNo + 10;
            context.fillText(subText, x, y);
          }
        }
      }
    }
  }

  function drawRect(context, location, color) {
    drawLine(context, location.topLeftCorner, location.topRightCorner, color);
    drawLine(context, location.topRightCorner, location.bottomRightCorner, color);
    drawLine(context, location.bottomRightCorner, location.bottomLeftCorner, color);
    drawLine(context, location.bottomLeftCorner, location.topLeftCorner, color);
  }

  function drawLine(context, begin, end, color) {
    context.beginPath();
    context.moveTo(begin.x, begin.y);
    context.lineTo(end.x, end.y);
    context.lineWidth = 4;
    context.strokeStyle = color;
    context.stroke();
  }

  // ====================
  //  Controller Methods
  // ====================

  function parseSeed(seed) {
    var state = { type: 'UNKNOWN', illegal: {} };
    seed = seed.trim();
    var parts = seed.split(':');
    seed = parts[0];
    var options = (parts.length > 1 ? parts[1] : "");

    if (seed == '')
      state.type = 'EMPTY';
    else if (! /^[9A-Z]+$/.test(seed))
      state.illegal.character = true;
    else if (seed.length == 81)
      state.type = 'PLAIN';
    else if (seed.length == 90)
      state.type = 'ADDRESS';
    else if (seed.length == 100)
      state.type = 'ENCRYPTED';
    else
      state.illegal.length = true;

    if (options) {
      state.scrypt = {};
      if (options[0] === 'P' && options.length > 1) {
        var p = parseInt(options[1]);
        if (p)
          state.scrypt.p = p;
      }

    }
    return state;
  }

  function generateAddress(seed) {
    var address;
    iota.api.getNewAddress(seed, { total: 1 }, (err, addr) => {
      address = addr[0];
    });
    return address;
  }


  function generateSeed() {
    var seed = randomTryteChar(81);
    return seed;
  }

  function randomTryteChar(count) {
    count = count || 1;
    let str = "";
    let values = randomValues(27, 81);
    for (var i = 0; i < count; i++) {
      str += IOTACHAR[values[i]];
    }
    return str;
  }

  function randomValues(maxValue, count) {
    if (maxValue > 256)
      throw new Error('Currently, randomValue() cannot create higher values than 256');

    let values = [];
    let randByte = new Uint8Array(1);
    let sets = Math.floor(256 / maxValue);
    let maxRand = maxValue * sets;

    while (values.length < count) {
      window.crypto.getRandomValues(randByte);
      if (randByte[0] < maxRand) {
        let randomValue = randByte[0] % maxValue;
        values.push(randomValue);
      }
    }
    return values;
  }


});