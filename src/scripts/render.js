import { getForecast } from "./api.js";

async function renderLocation(location) {
  const forecast = await getForecast(location);
  const locationHeading = document.querySelector("h2#location");
  locationHeading.textContent = forecast.resolvedAddress;
  const description = document.querySelector("p#description");
  description.textContent = forecast.description;
  const conditions = document.querySelector("#conditions");
  conditions.style.visibility = "visible";
  const conditionsHeading = document.querySelector("#conditions h3");
  conditionsHeading.textContent = `Conditions at ${forecast.currentConditions.datetime.slice(0, 5)}`;
  const conditionsTimezone = document.querySelector("#conditions h4");
  conditionsTimezone.textContent = ` (Local Time)`;
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
