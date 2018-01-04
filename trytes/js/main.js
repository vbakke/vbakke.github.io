$(document).ready(function () {

  $('#txtUnicodeNative').on('change keyup paste', function (e) {
    let text = $(e.currentTarget).val();
    let tryteStr = trytes.encodeTextAsTryteString(text);
    let $dest = $('#txtUnicodeEncoded');
    $dest.val(tryteStr);
  });

  $('#txtUnicodeEncoded').on('change keyup paste', function (e) {
    let text = $(e.currentTarget).val();
    let tryteStr = trytes.decodeTextFromTryteString(text);
    let $dest = $('#txtUnicodeNative');
    $dest.val(tryteStr);
  });

  $('#txtTrytesNative').on('change keyup paste', function (e) {
    let text = $(e.currentTarget).val();
    let tryteStr = trytes.encodeTryteStringAsBytes(text);
    let $dest = $('#txtTrytesEncoded');
    $dest.val(tryteStr);
  });

  $('#txtTrytesEncoded').on('change keyup paste', function (e) {
    let text = $(e.currentTarget).val();
    let byteStrings = text.split(',');
    let bytes = [];
    let ok = true;
    for (let i=0; i<byteStrings.length; i++) {
      bytes[i] = parseInt(byteStrings[i].trim());
      if (isNaN(bytes[i]))
        ok = false;
    }
    let tryteStr = (!ok) ? '' :  trytes.decodeTryteStringFromBytes(bytes);
    let $dest = $('#txtTrytesNative');
    $dest.val(tryteStr);
  });
});