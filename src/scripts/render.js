import { getForecast } from "./api.js";

async function renderLocation(location) {
  const forecast = await getForecast(location);
  renderLocationTitle(forecast);
  renderLocationConditions(forecast);
}

function renderLocationTitle(forecast) {
  const locationHeading = document.querySelector("h2#location");
  locationHeading.textContent = forecast.resolvedAddress;
  const description = document.querySelector("p#description");
  description.textContent = forecast.description;
}

function renderLocationConditions(forecast) {
  const conditions = document.querySelector("#conditions");
  conditions.style.visibility = "visible";
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
  conditionsWindDirection.textContent = calculateCardinalDirection(forecast.currentConditions.winddir);
  const conditionsUVIndex = document.querySelector("p#uv-index");
  conditionsUVIndex.textContent = forecast.currentConditions.uvindex;
}

function calculateCardinalDirection(bearing) {
  const directions = [
    "N",
    "NE",
    "E",
    "SE",
    "S",
    "SW",
    "W",
    "NW",
  ];

  const index = Math.round(bearing / 45) % 8;

  return directions[index];
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
