import keys from "./keys.js";
import urls from "./urls.js";

function constructURL(base_url, params) {
  let params_str = "?";
  //Attach all parameters to the URL
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      let parameter = key + "=" + value;
      params_str += parameter + "&";
    }
  }
  const suffix = "key=" + keys.visualCrossing;
  const url = base_url + params_str + suffix;

  return url;
}

async function getForecastJSON(location) {
  const base_url = urls.forecast + location;
  const params = { unitGroup: "metric" };
  const forecast_data = await fetch(constructURL(base_url, params));
  const forecastJSON = await forecast_data.json();
  return forecastJSON;
}

async function getForecast(location) {
    const forecastJSON = await getForecastJSON(location);
    const {currentConditions, days, description} = forecastJSON;
    console.log({currentConditions, days, description});
    return {currentConditions, days, description};
    
}

getForecast('glencoe, sa');


export {};
