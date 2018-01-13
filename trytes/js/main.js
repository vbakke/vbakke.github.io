$(document).ready(function () {

  //calcLengths();
  
  function calcLengths() {
    calcLength('#txtUnicodeNative', '#lenUnicodeBytes')
    calcLength('#txtUnicodeEncodedLegacy', '#lenUnicodeTrytesLegacy')
    calcLength('#txtUnicodeEncoded', '#lenUnicodeTrytes')
  }
  function calcLength(textarea, span) {
    var $textarea = $(textarea);
    $span = $(span);
    $span.text( $textarea.val().length );
  }
  $('#txtUnicodeNative').on('change keyup paste', function (e) {
    let text = $(e.currentTarget).val();
    let tryteStr = trytes.encodeTextAsTryteStringLegacy(text);
    let $dest = $('#txtUnicodeEncodedLegacy');
    $dest.val(tryteStr);
    
    tryteStr = trytes.encodeTextAsTryteString(text);
    $dest = $('#txtUnicodeEncoded');
    $dest.val(tryteStr);
    
    calcLengths();
  });
  
  $('#txtUnicodeEncodedLegacy').on('change keyup paste', function (e) {
    let tryteStr = $(e.currentTarget).val();
    let text = trytes.decodeTextFromTryteString(tryteStr);
    let $dest = $('#txtUnicodeNative');
    $dest.val(text);

    tryteStr = trytes.encodeTextAsTryteString(text);
    $dest = $('#txtUnicodeEncoded');
    $dest.val(tryteStr);


    calcLengths();
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

  
  $('#txtUnicodeNative').change();
});