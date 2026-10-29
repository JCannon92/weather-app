import { getForecast } from "./api.js";
import Chart from 'chart.js/auto';

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
  //Set forecast information to hidden
  const forecastDisplayElement = document.querySelector("div#forecast-display");
  forecastDisplayElement.style.visibility = "hidden";
  const hourListElement = document.querySelector("div#hour-list");
  hourListElement.style.visibility = "hidden";
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
    let dateElement = document.createElement("p");
    dateElement.textContent = `${date.toLocaleDateString("en-GB")}`;
    dateElement.classList.add("date");

    dayElement.appendChild(dayNameElement);
    dayElement.appendChild(dateElement);
    dayList.appendChild(dayElement);

    //Render day if clicked on
    dayElement.addEventListener("click", (event) => {
      //Set selected style on only the selected element
      const dayElements = document.querySelectorAll('div.day');
      dayElements.forEach(element => element.classList.remove('selected'));
      dayElement.classList.add('selected');
      //Render the display and hours
      renderForecastDay(day);
      renderForecastHours(day);
      //Update the chart when a new day is selected, by default shows temp
      updateChart(
        prepareChartLabels(day),
        'Temperature',
        day.hours.map(hour => hour.temp),
      );
    });
  }

  //Render the first day and chart
  const firstDay = forecast.days[0];
  renderForecastDay(firstDay);
  updateChart(prepareChartLabels(firstDay), 'Temperature', firstDay.hours.map(hour => hour.temp));
}

function renderForecastDay(day) {
  const forecastDisplayElement = document.querySelector("div#forecast-display");
  forecastDisplayElement.style.visibility = "visible";
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
  //Render the chart

}

function renderForecastHours(day) {
  const hourMatrixElement = document.querySelector("div#hour-list");
  //Clear hour matrix
  hourMatrixElement.replaceChildren();
  hourMatrixElement.style.visibility = "visible";
  //Set headers
  const hourHeaders = [
    "Time",
    "Temp.",
    "Precip. %",
    "UV Indx.",
    "Wind Sp.",
    "Wind Dir.",
    "Visib.",
  ];

  hourHeaders.forEach((element) => {
    const hourHeaderElement = document.createElement("h6");
    hourHeaderElement.textContent = element;
    hourMatrixElement.appendChild(hourHeaderElement);
  });
  //Set hour matrix values
  day.hours.forEach(renderForecastHour);
}

function renderForecastHour(hour) {
  const hourMatrixElement = document.querySelector("div#hour-list");

  const hourInformationHeadings = [
    "datetime",
    // 'icon',
    "temp",
    "precipprob",
    "uvindex",
    "windspeed",
    "winddir",
    "visibility",
  ];

  hourInformationHeadings.forEach((property) => {
    const hourElement = document.createElement("p");
    hourElement.classList.add("hour-matrix");

    //Some API properties are modified before rendering
    if (property === "datetime") {
      hourElement.textContent = hour[property].slice(0, 5);
    } else if (property === "winddir") {
      hourElement.textContent = calculateCardinalDirection(hour[property]);
    } else {
      hourElement.textContent = hour[property];
    }

    hourMatrixElement.appendChild(hourElement);
  });
}

//Charting functions

function prepareChartLabels(day) {
  //Return an array of time labels
  return day.hours.map(element => element.datetime.slice(0,5));
}

function prepareChartScales(data, type) {
  //For temp, set the min to 0 if there are no records below 0, otherwise set to floor 
  let minY;
  let maxY;
  if (type === 'temp') {
    //Min
    if (Math.min(...data) >= 0) {
      minY = 0;
    } else {
      minY = Math.floor(Math.min(...data) / 10) * 10;
    }
    //Max
    if (Math.max(...data) <= 30) {
      maxY = 30;
    } else {
      maxY = Math.ceil(Math.max(...data) / 10) * 10;
    }
  }
  return {
    min: minY,
    max: maxY,
  }
}

function renderChart() {
  //Render chart for the first time
  const chartElement = document.getElementById('forecast-chart');

  new Chart(chartElement, {
    type : 'line',
    data: {
      datasets: [{
        fill: false,
        borderColor: 'red',
        tension: 0.2,
        pointStyle: false,
      }],
    },
    options: {
      plugins: {
        tooltip: {
          enabled: false,
        },
      },
      hover: {
        mode: null,
      },
      response: true,
      maintainAspectRatio: false,
    }
  });
}

function updateChart(labels, type, newData) {
  //Make chart visible
  const chartContainerElement = document.querySelector('div.chart-container');
  chartContainerElement.style.visibility = 'visible';
  const chart = Chart.getChart('forecast-chart');

  //Add new data
  chart.data.labels = labels;
  chart.data.datasets[0].label = type;
  chart.data.datasets[0].data = newData;

  //Update Y axis to reflect new data

  chart.options.scales = {
      y: prepareChartScales(newData, 'temp'),
    }

  chart.update();
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

renderChart();

