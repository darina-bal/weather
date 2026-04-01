// AJAX-RESPONSE - START
const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
const weekdays = [
    'Sun', 'Mon', 'Tue', 'Wed',
    'Thu', 'Fri', 'Sat'
];

const times = [1, 4, 7, 10, 13, 16, 19, 22];
var minTemp = -10;
var maxTemp = 30;

let typeChecked = false;
let data = null;

function loadDoc(inputText) {
    if (!inputText) {
        return;
    }
    const xhttp = new XMLHttpRequest();
    xhttp.timeout = 10000;
    xhttp.ontimeout = function() {
        console.error('Превышен лимит ожидания ответа (тайм‑аут)');
        modalError('Timeout');
        document.querySelector('.preview__preloader').style.display = 'none';
    };
    xhttp.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(this.responseText);
            console.log("data", data);
            drawData();
        } else {
            modalError(this.status);
            document.querySelector('.preview__preloader').style.display = 'none';
        }
    }
    xhttp.open("GET", `https://api.weatherapi.com/v1/forecast.json?key=bc2055f2bbe647c492664647262403&q=${inputText}&days=8`, true);
    xhttp.send();
    document.querySelector('.preview__preloader').style.display = 'flex';
    document.querySelector('.preview__slider').style.display = 'none';
    document.querySelector('.preview__time-icons').style.display = 'none';
    document.querySelector('.preview__widget-temperature').style.display = 'none';
}

function drawData() {
    if (!data) {
        return;
    }

    document.querySelector('.preview__preloader').style.display = 'none';
    document.querySelector('.preview__slider').style.display = 'flex';
    document.querySelector('.preview__time-icons').style.display = 'block';
    document.querySelector('.preview__widget-temperature').style.display = 'block';


    let timeUp = new Date(data.current.last_updated);
    let date = new Date(data.location.localtime);

    let typeTemp = 'temp_c';
    let typeDegree = '°C';
    if (typeChecked) {
        typeTemp = 'temp_f';
        typeDegree = '°F';
        minTemp = 14;
        maxTemp = 86;
    };


    document.querySelector('.preview__navigation_time_hours').textContent = timeUp.getHours() < 10 ? `0${timeUp.getHours()}` : `${timeUp.getHours()}`;
    document.querySelector('.preview__navigation_time_minutes').textContent = timeUp.getMinutes() < 10 ? `0${timeUp.getMinutes()}` : `${timeUp.getMinutes()}`;

    var slides = document.querySelectorAll('.preview__slider_windows .preview__main-window');

    var templateWindows = ``;
    data.forecast.forecastday.forEach((dayData, index) => {
        if (index == 0) {
            var activeWindow = ' active';
            var temperatureWindow = data.current[typeTemp] + typeDegree;
            var conditionSrcImg = data.current.condition.icon;
            var humidity = data.current.humidity + '%';
            var visibility = data.current.vis_km + 'km';
            var wind = data.current.wind_mph + 'mph';
        } else {
            var activeWindow = '';
            var temperatureWindow = (typeChecked) ? dayData.day.mintemp_f + ' — ' + dayData.day.maxtemp_f + typeDegree : dayData.day.mintemp_c + ' - ' + dayData.day.maxtemp_c + typeDegree;
            var conditionSrcImg = dayData.day.condition.icon;
            var humidity = dayData.day.avghumidity + '%';
            var visibility = dayData.day.avgvis_km + 'km';
            var wind = dayData.day.maxwind_mph + 'mph';
        }

        let calendar = new Date(dayData.date);
        var month = months[calendar.getMonth()] + ' ' + calendar.getDate();
        var week = weekdays[calendar.getDay()];
        var pressure = data.current.pressure_mb + 'hPa';
        var left = (817 + 120) * index + 'px';
        if (!slides.length) {
            templateWindows += `<div class="preview__main-window${activeWindow}" style='left:${left};' slide-index="${index}">
                                <div class="preview__main-window_wrapper">
                                    <div class="preview__main-window_location">${data.location.name}</div>
                                    <div class="preview__main-window_temperature_temp">
                                        <div class="preview__main-window_temperature">${temperatureWindow}</div>
                                        <picture>
                                            <img src="${conditionSrcImg}">
                                        </picture>
                                    </div>
                                    <div class="preview__main-window_calendar">
                                        <span class="preview__main-window_calendar_month">${month}</span>, <span
                                            class="preview__main-window_calendar_week">${week}</span>
                                    </div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Humidity</th>
                                                <th>Visiblity</th>
                                                <th>Air Pressure</th>
                                                <th>Wind</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td id="currentHum">${humidity}</td>
                                                <td id="currentVis">${visibility}</td>
                                                <td id="currentPress">${pressure}</td>
                                                <td id="currentWind">${wind}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>`;
        } else {
            slides[index].querySelector('.preview__main-window_temperature').textContent = temperatureWindow;
            slides[index].querySelector('.preview__main-window_location').textContent = data.location.name;
            slides[index].querySelector('.preview__main-window_temperature_temp img').src = conditionSrcImg;
            slides[index].querySelector('#currentHum').textContent = humidity;
            slides[index].querySelector('#currentVis').textContent = visibility;
            slides[index].querySelector('#currentPress').textContent = pressure;
            slides[index].querySelector('#currentWind').textContent = wind;
        }
    });
    if (templateWindows) {
        document.querySelector('.preview__slider_windows').innerHTML = templateWindows;
    }

    setWidgetTemperature(data.forecast.forecastday[0], typeChecked);

    if (!mainSlider) {
        mainSlider = initSlider(817, 120);
    }
}
var mainSlider = null;
// AJAX-RESPONSE - END

// TOGGLE SWITCH - START

let toggleSwitchInput = document.querySelector('.preview__degrees_toggle-switch input');
let temperatureDesc = document.querySelector('.preview__widget-temperature_text_desc');

toggleSwitchInput.addEventListener('change', function () {
    toggleSwitchChange(this);
    drawData();
});

function toggleSwitchChange(e) {
    if (e.checked) {
        typeChecked = true;
        temperatureDesc.textContent = 'Температура воздуха, °F';
    } else {
        typeChecked = false;
        temperatureDesc.textContent = 'Температура воздуха, °C';
    }
}

// TOGGLE SWITCH - END

// WIDGET-TEMPERATURE - START

// Функция для генерации цвета в формате RGB
function getColor(value, min, max, opacity) {
    let a = opacity;
    const normalized = (value - min) / (max - min);

    // Точка зелёного цвета в нормализованной шкале: +10°C из [-40; +40]
    const greenPointNormalized = (10 - min) / (max - min); // (10 - (-40)) / 80 = 50 / 80 = 0.625

    let red = null,
        green = null,
        blue = null;

    if (normalized < greenPointNormalized) {
        // От тёмно‑синего (-40°C) до зелёного (+10°C)
        // Синий убывает от 255 до 0
        blue = 255 - Math.round(255 / greenPointNormalized * normalized);
        // Зелёный возрастает от 0 до 255
        green = Math.round(255 / greenPointNormalized * normalized);
        red = 0;
    } else {
        // От зелёного (+10°C) до тёмно‑красного (+40°C)
        // Зелёный убывает от 255 до 0
        const relativePos = (normalized - greenPointNormalized) / (1 - greenPointNormalized);
        green = 255 - Math.round(255 * relativePos);
        // Красный возрастает от 0 до 255
        red = Math.round(255 * relativePos);
        blue = 0;
    }

    return `rgba(${red}, ${green}, ${blue}, ${a})`;
}

function widgetTemperature(temperatureData) {
    let temperatureColors = {};

    let maxDegree = Math.max(...temperatureData);
    let minDegree = Math.min(...temperatureData);
    let widgetValues = document.querySelector('.preview__widget-temperature_values_value');
    let gFillPath = document.querySelector('#gFillPath');
    let gPath = document.querySelector('#gPath');
    let gradients = document.querySelector('#svg-temperature').getElementsByTagName('defs')[0];
    let htmlTemps = ``;
    let htmlGFillPath = ``;
    let htmlGPath = ``;
    let htmlGradients = ``;
    let gFillPathNumberX = 0;
    let gradIndex = 0;
    let down = 0;
    let up = 0;
    let rubberWidth = document.querySelector('.preview__widget-temperature').offsetWidth;
    let rubberHeight = document.querySelector('.preview__widget-temperature').offsetHeight;

    let heightWidget = 31 + 3 * (maxDegree - minDegree);

    document.querySelector('#svg-temperature').setAttribute('viewBox', `0 0 440 ${heightWidget}`);
    document.querySelector('#svg-temperature').setAttribute('height', `100%`);

    for (let i = 0; i < temperatureData.length; i++) {
        let temp = temperatureData[i];
        let formatedTemp = (temp > 0) ? '+' + temp : temp;
        let gFillPathNumberY = (maxDegree - temp) * 3;
        let coef = (gFillPathNumberY * 3.08 + 30) / 1357;

        htmlTemps += `<span value="${temp}" style="top: ${coef * rubberWidth}px;">${formatedTemp}</span>`;
        htmlGFillPath += `<path d="M${gFillPathNumberX},${gFillPathNumberY}L${gFillPathNumberX + 55},${gFillPathNumberY}L${gFillPathNumberX + 55},${gFillPathNumberY + 30}L${gFillPathNumberX},${gFillPathNumberY + 30}" stroke="none" fill="${getColor(temp, minTemp, maxTemp, 0.25)}"></path>`;
        htmlGPath += `<path d="M${gFillPathNumberX},${gFillPathNumberY}L${gFillPathNumberX + 55},${gFillPathNumberY}L${gFillPathNumberX + 55},${gFillPathNumberY + 1}L${gFillPathNumberX},${gFillPathNumberY + 1}" stroke="none" fill="${getColor(temp, minTemp, maxTemp, 1)}"></path>`;

        if (i != temperatureData.length - 1) {
            let verticalLine = (Math.abs(temperatureData[i + 1] - temperatureData[i])) * 3;

            if (temperatureData[i] > temperatureData[i + 1]) {
                up = 0;
                down = 100;
                htmlGPath += `<path d="M${gFillPathNumberX + 55},${gFillPathNumberY}L${gFillPathNumberX + 55},${gFillPathNumberY + verticalLine}L${gFillPathNumberX + 56},${gFillPathNumberY + verticalLine}L${gFillPathNumberX + 56},${gFillPathNumberY}" stroke="none" fill="url(#fill-${gradIndex})"></path>`;
            } else if (temperatureData[i] == temperatureData[i + 1]) {
                up = 0;
                down = 0;
            } else {
                up = 100;
                down = 0;
                htmlGPath += `<path d="M${gFillPathNumberX + 55},${gFillPathNumberY + 1}L${gFillPathNumberX + 55},${gFillPathNumberY - verticalLine}L${gFillPathNumberX + 56},${gFillPathNumberY - verticalLine}L${gFillPathNumberX + 56},${gFillPathNumberY + 1}" stroke="none" fill="url(#fill-${gradIndex})"></path>`;
            }
            // console.log(gradIndex, 'up =', up, 'down =', down, 'temperatureData[i] =', temperatureData[i], 'temperatureData[i + 1] =', temperatureData[i + 1]);


            htmlGradients += `<linearGradient id="fill-${gradIndex}" x1="0%" x2="0%" y1="${up}%" y2="${down}%"><stop offset="0" stop-color="${getColor(temperatureData[i], minTemp, maxTemp, 1)}"></stop><stop offset="1" stop-color="${getColor(temperatureData[i + 1], minTemp, maxTemp, 1)}"></stop></linearGradient>`;
            gradIndex++;

        } else {
            continue;
        }

        gFillPathNumberX += 55;

    }

    document.querySelector('.preview__bottom').style.opacity = 0;
    setTimeout(() => {
        widgetValues.innerHTML = htmlTemps;
        gFillPath.innerHTML = htmlGFillPath;
        gradients.innerHTML = htmlGradients;
        gPath.innerHTML = htmlGPath;
        document.querySelector('.preview__bottom').style.opacity = 1;
    }, 500);

}

// WIDGET-TEMPERATURE - END


// SEARCH-LOCATION - START

document.querySelector('.preview__search input').addEventListener('change', function () {
    loadDoc(this.value);
})

// SEARCH-LOCATION - END

// SLIDER - START 

function initSlider(widthSlide, gapSlide) {

    let sliderObject = {
        slider: null,
        leftButton: null,
        rightButton: null,
        slidesWrapper: null,
        slides: null,
        today: null,
        tomorrow: null,
        indexActive: 0,
        maxSlides: 0,
        init: function () {
            this.slider = document.querySelector('.preview__slider');
            if (!this.slider) { alert('Error: отсутствует блок слайдера'); return false; }
            if (this.slider.classList.contains('init')) { return false; }

            this.leftButton = this.slider.querySelector('.preview__slider_buttons_left-arrow');
            if (!this.leftButton) { alert('Error: отсутствует кнопка назад у слайдера'); return false; }

            this.rightButton = this.slider.querySelector('.preview__slider_buttons_right-arrow');
            if (!this.rightButton) { alert('Error: отсутствует кнопка вперед у слайдера'); return false; }

            this.slidesWrapper = this.slider.querySelector('.preview__slider_windows');
            if (!this.slidesWrapper) { alert('Error: отсутствует обертка слайдов'); return false; }

            this.slides = this.slidesWrapper.querySelectorAll('.preview__main-window');
            if (!this.slides) { alert('Error: отсутствуют слайды'); return false; }

            this.maxSlides = this.slides.length - 1;
            if (this.maxSlides < 2) { alert('Error: недостаточно слайдов для инициализации слайдера'); return false; }

            this.today = document.querySelector('.preview__navigation_wrapper_option.today');
            if (!this.today) { alert('Error: отсутствует кнопка today'); return false; }
            this.tomorrow = document.querySelector('.preview__navigation_wrapper_option.tomorrow');
            if (!this.tomorrow) { alert('Error: отсутствует кнопка tomorrow'); return false; }

            this.slidesWrapper.style.left = 0;
            this.leftButton.classList.add('arrow-disabled');
            this.rightButton.classList.remove('arrow-disabled');

            const self = this;
            this.leftButton.addEventListener('click', function () {self.left();});
            this.rightButton.addEventListener('click', function () {self.right();});
            this.today.addEventListener('click', function () {self.todayFunc();});
            this.tomorrow.addEventListener('click', function () {self.tomorrowFunc();});

            this.slider.classList.add('init');
            // todayTomorrowWeekly();
            return true;
        },
        left: function () {
            if (this.leftButton.classList.contains('arrow-disabled')) {
                return false;
            }
            this.indexActive--;
            if (this.indexActive <= 0) {
                this.indexActive = 0;
                this.leftButton.classList.add('arrow-disabled');
            }
            if (this.indexActive < this.maxSlides) {
                this.rightButton.classList.remove('arrow-disabled');
            }
            this.slides.forEach((el, index) => {
                el.classList.remove('active');
            });
            this.slides[this.indexActive].classList.add('active');
            this.slidesWrapper.style.left = 0 - ((widthSlide + gapSlide) * this.indexActive) + 'px';

            if (this.indexActive != 0) {
                this.today.classList.remove('active');
            } else {
                this.today.classList.add('active');
            }
            if (this.indexActive != 1) {
                this.tomorrow.classList.remove('active');
            } else {
                this.tomorrow.classList.add('active');
            }

            setWidgetTemperature(data.forecast.forecastday[this.indexActive], typeChecked);
        },
        right: function () {
            if (this.rightButton.classList.contains('arrow-disabled')) {
                return false;
            }
            this.indexActive++;
            if (this.indexActive >= this.maxSlides) {
                this.indexActive = this.maxSlides;
                this.rightButton.classList.add('arrow-disabled');
            }
            if (this.indexActive > 0) {
                this.leftButton.classList.remove('arrow-disabled');
            }
            this.slides.forEach((el, index) => {
                el.classList.remove('active');
            });
            this.slides[this.indexActive].classList.add('active');
            this.slidesWrapper.style.left = 0 - ((widthSlide + gapSlide) * this.indexActive) + 'px';

            if (this.indexActive != 0) {
                this.today.classList.remove('active');
            } else {
                this.today.classList.add('active');
            }
            if (this.indexActive != 1) {
                this.tomorrow.classList.remove('active');
            } else {
                this.tomorrow.classList.add('active');
            }

            setWidgetTemperature(data.forecast.forecastday[this.indexActive], typeChecked);
        },
        todayFunc: function () {
            if (!this.today.classList.contains('active')) {
                this.today.classList.add('active');
            }

            if (this.tomorrow.classList.contains('active')) {
                this.tomorrow.classList.remove('active');
            }

            if ( mainSlider ) {
                mainSlider.moveSlide(0);
            }
        },
        tomorrowFunc: function () {
            if (!this.tomorrow.classList.contains('active')) {
                this.tomorrow.classList.add('active');
            }

            if (this.today.classList.contains('active')) {
                this.today.classList.remove('active');
            }
            
            if ( mainSlider ) {
                mainSlider.moveSlide(1);
            }
        },
        moveSlide: function (i) {
            console.log("i",i);
            this.indexActive = i;

            if (this.indexActive <= 0) {
                this.indexActive = 0;
                this.leftButton.classList.add('arrow-disabled');
                this.rightButton.classList.remove('arrow-disabled');
            } else if (this.indexActive >= this.maxSlides) {
                this.indexActive = this.maxSlides;
                this.rightButton.classList.add('arrow-disabled');
                this.leftButton.classList.remove('arrow-disabled');
            } else {
                this.leftButton.classList.remove('arrow-disabled');
                this.rightButton.classList.remove('arrow-disabled');
            }

            this.slides.forEach((el, index) => {
                el.classList.remove('active');
            });
            this.slides[this.indexActive].classList.add('active');

            this.slidesWrapper.style.left = 0 - ((widthSlide + gapSlide) * this.indexActive) + 'px';

            setWidgetTemperature(data.forecast.forecastday[this.indexActive], typeChecked);
        }
    };

    let result = sliderObject.init();
    if (!result) {
        return false;
    }


    return sliderObject;
}

// SLIDER - END

// function todayTomorrowWeekly() {
//     var today = document.querySelector('.preview__navigation_wrapper_option.today');
//     var tomorrow = document.querySelector('.preview__navigation_wrapper_option.tomorrow');

//     today.addEventListener('click', todayFunc);
//     function todayFunc() {
//         if (!today.classList.contains('active')) {
//             today.classList.add('active');
//         }

//         if (tomorrow.classList.contains('active')) {
//             tomorrow.classList.remove('active');
//         }

//         if ( mainSlider ) {
//             mainSlider.moveSlide(0);
//         }
//     }

//     tomorrow.addEventListener('click', tomorrowFunc);
//     function tomorrowFunc() {
//         if (!tomorrow.classList.contains('active')) {
//             tomorrow.classList.add('active');
//         }

//         if (today.classList.contains('active')) {
//             today.classList.remove('active');
//         }
        
//         if ( mainSlider ) {
//             mainSlider.moveSlide(1);
//         }
//     }
// }

function setWidgetTemperature(day, tChecked) {
    let typeTemp = (tChecked) ? 'temp_f' : 'temp_c';
    let icon_index = 1;
    let temperatureData = [];
    day.hour.forEach((item, index) => {
        let date = new Date(item.time);
        let hours = date.getHours();
        if (times.indexOf(hours) != -1) {
            temperatureData.push(Math.round(item[typeTemp]));
            document.querySelector(`#icon${icon_index}`).src = item.condition.icon;
            document.querySelector(`#icon${icon_index}`).alt = item.condition.text;
            icon_index++;
        }
    });
    widgetTemperature(temperatureData);
}

// MODAL-ERROR - START 

function modalError(status) {
    function hide() {
        document.querySelector('.modal').style.display = 'none';
        document.querySelector('.modal__error_back-button button').removeEventListener('click', hide);
    }
    document.querySelector('.modal__error_status').textContent = status;
    document.querySelector('.modal__error_back-button button').addEventListener('click', hide);

    document.querySelector('.modal').style.display = 'flex';
}

// MODAL-ERROR - END