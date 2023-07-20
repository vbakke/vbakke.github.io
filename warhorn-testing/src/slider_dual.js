
const awakeColor = '#eeeeee';
const sleepColor = '#bababa';

addEventListener("DOMContentLoaded", async (event) => {
    let $inputs = document.querySelectorAll('.slider-dual input');
    if ($inputs) $inputs.forEach($input => $input.addEventListener('input', onSliderMove));
    onSliderMove();
});


function onSliderMove() {
    let $from = document.querySelector('.slider-dual .from');
    let $to = document.querySelector('.slider-dual .to');
    let from = parseInt($from.value);
    let to = parseInt($to.value);
    fillSlider(from, to, $to);

    let $time = document.querySelector('.filter-time-value');
    $time.textContent = `${from.toString().padStart(2, '0')}:00 - ${to.toString().padStart(2, '0')}:00`;
    
}


function fillSlider(from, to, controlSlider) {
    const rangeDistance = 24; 
    const fromPosition = Math.min(from, to);
    const toPosition = Math.max(from, to);
    const innerColor = (from < to) ? awakeColor : sleepColor;
    const outerColor = (from > to) ? awakeColor : sleepColor;


    controlSlider.style.background = `linear-gradient(
      to right,
      ${outerColor} 0%,
      ${outerColor} ${(fromPosition)/(rangeDistance)*100}%,
      ${innerColor} ${(fromPosition)/(rangeDistance)*100}%,
      ${innerColor} ${(toPosition)/(rangeDistance)*100}%, 
      ${outerColor} ${(toPosition)/(rangeDistance)*100}%, 
      ${outerColor} 100%)`;
}
