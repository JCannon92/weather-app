import { getForecast } from "./api.js";

async function renderLocation(location) {
  //Reset forecast if applicable
  const forecast = await getForecast(location);
  const locationElement = document.querySelector("div#location");
  locationElement.style.visibility = "visible";
  renderLocationTitle(forecast);
  renderLocationConditions(forecast);
  renderForecastDays(forecast);
}

function renderLocationTitle(forecast) {
  const locationHeading = document.querySelector("h2#location");
  locationHeading.textContent = forecast.resolvedAddress;
  const description = document.querySelector("p#description");
  description.textContent = forecast.description;
}

function renderLocationConditions(forecast) {
  const conditionsHeading = document.querySelector("#conditions h3");
  conditionsHeading.textContent = `Conditions at ${forecast.currentConditions.datetime.slice(0, 5)}`;
  const conditionsTimezone = document.querySelector("#conditions h4");
  conditionsTimezone.textContent = ` (Local Time):`;
  const conditionsWeather = document.querySelector("p#weather");
  conditionsWeather.textContent = forecast.currentConditions.conditions;
  const conditionsTemperature = document.querySelector("p#temperature");
  conditionsTemperature.textContent = forecast.currentConditions.temp;
  const conditionsWindSpeed = document.querySelector("p#wind-speed");
  conditionsWindSpeed.textContent = forecast.currentConditions.windspeed;
  const conditionsWindDirection = document.querySelector("p#wind-dir");
  conditionsWindDirection.textContent = calculateCardinalDirection(
    forecast.currentConditions.winddir,
  );
  const conditionsUVIndex = document.querySelector("p#uv-index");
  conditionsUVIndex.textContent = forecast.currentConditions.uvindex;
}

function calculateCardinalDirection(bearing) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  const index = Math.round(bearing / 45) % 8;

  return directions[index];
}

function renderForecastDays(forecast) {
  const dayList = document.querySelector("div#day-list");
  //Clear the list of days
  dayList.replaceChildren();
  //Render the list of days
  for (let day of forecast.days) {
    let date = new Date(day.datetime);

    let dayElement = document.createElement("div");
    dayElement.classList.add("day");
    dayElement.id = day.datetime;

    let dayNameElement = document.createElement("p");
    let dayText = `${date.toLocaleDateString("en-GB", { weekday: "short" })}`;
    dayNameElement.textContent = dayText;
    dayNameElement.classList.add("day-name");
    if (dayText === "Sat" || dayText === "Sun") {
      dayElement.classList.add("weekend");
    }
    let dateElement = document.createElement("p");
    dateElement.textContent = `${date.toLocaleDateString("en-GB")}`;
    dateElement.classList.add("date");

    dayElement.appendChild(dayNameElement);
    dayElement.appendChild(dateElement);
    dayList.appendChild(dayElement);

    //Render day if clicked on
    dayElement.addEventListener("click", (event) => {
      renderForecastDay(day);
      renderForecastHours(day);
    });
  }
}

function renderForecastDay(day) {
  let date = new Date(day.datetime);
  const dayTitleElement = document.querySelector("div#forecast-display h4");
  dayTitleElement.textContent = `${date.toLocaleDateString("en-GB", { weekday: "long" })} | ${date.toLocaleDateString("en-GB")}`;
  const forecastDayElements = document.querySelectorAll(
    "div#forecast-display div#forecast-day-info p",
  );
  forecastDayElements.forEach(
    (element) => (element.textContent = day[element.id]),
  );
  //Exception for wind direction as it needs to be replaced with the cardinal direction
  const windDirectionElement = document.querySelector(
    "div#forecast-display div#forecast-day-info p#winddir",
  );
  windDirectionElement.textContent = calculateCardinalDirection(day.winddir);
}

function renderForecastHours(day) {
  const hourMatrixElement = document.querySelector('div#hour-list');
  //Clear hour matrix
  hourMatrixElement.replaceChildren();
  hourMatrixElement.style.visibility = 'visible';
  //Set headers
  const hourHeaders = [
    'Time',
    'Temp.',
    'Precip. %',
    'UV Indx.',
    'Wind Sp.',
    'Wind Dir.',
    'Visib.'
  ];

  hourHeaders.forEach(element => {
    const hourHeaderElement = document.createElement('h6');
    hourHeaderElement.textContent = element;
    hourMatrixElement.appendChild(hourHeaderElement);
  });
  //Set hour matrix values
  day.hours.forEach(renderForecastHour);
}

function renderForecastHour(hour) {
  const hourMatrixElement = document.querySelector('div#hour-list');

  const hourInformationHeadings = [
    'datetime',
    // 'icon',
    'temp',
    'precipprob',
    'uvindex',
    'windspeed',
    'winddir',
    'visibility'
  ];

  hourInformationHeadings.forEach(property => {
    const hourElement = document.createElement('p');
    hourElement.classList.add('hour-matrix');

    //Some API properties are modified before rendering
    if (property === 'datetime') {
      hourElement.textContent = hour[property].slice(0,5);
    } else if (property === 'winddir') {
      hourElement.textContent = calculateCardinalDirection(hour[property]);
    } else {
      hourElement.textContent = hour[property];
    }

    hourMatrixElement.appendChild(hourElement);
  });
}

const searchLocationForm = document.querySelector("form.search-location");
searchLocationForm.addEventListener("submit", (event) =>
  event.preventDefault(),
);

const searchLocationButton = document.querySelector("button.search-location");
searchLocationButton.addEventListener("click", (event) =>
  renderLocation(searchLocationInput.value),
);

const searchLocationInput = document.querySelector("input.search-location");
searchLocationInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchLocationButton.click();
  }
});
