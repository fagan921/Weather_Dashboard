
import dotenv from 'dotenv';

dotenv.config();
// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  name: string;
  date: Date;
  icon: string;
  iconDescription: string;
  temp: number;
  humidity: number;
  windSpeed: number;

  constructor(
    name: string,
    date: Date,
    icon: string,
    iconDescription: string,
    temp: number,
    humidity: number,
    windSpeed: number
  ) {
    this.name = name;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.temp = temp;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  private baseURL: string = process.env.API_BASE_URL || 'https://api.openweathermap.org/data/2.5';
  private apiKey: string = process.env.API_KEY || '';
  private cityName: string = '';
  
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any[]> {
    const geocodeQuery = this.buildGeocodeQuery(query);
    const response = await fetch(geocodeQuery);
    if (!response.ok) {
      throw new Error(`Failed to fetch location data for ${query}`);
    }
    return await response.json();
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any[]): Coordinates {
    const { lat, lon } = locationData[0]; // Assume locationData is an array with the first item containing coordinates
    return { lat, lon };
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(city: string): string {
    return `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
  }

  // TODO: Create buildForecastQuery method
  private buildForecastQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const weatherQuery = this.buildWeatherQuery(coordinates);
    const response = await fetch(weatherQuery);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    return await response.json();
  }

  // TODO: Create fetchForecastData method
  private async fetchForecastData(coordinates: Coordinates): Promise<any> {
    const forecastQuery = this.buildForecastQuery(coordinates);
    const response = await fetch(forecastQuery);
    if (!response.ok) {
      throw new Error('Failed to fetch forecast data');
    }
    return await response.json();
  }

  // TODO: Create parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const {
      name,
      weather: [{ icon, description }],
      main: { temp, humidity },
      wind: { speed },
      dt,
    } = response;
    
    const date = new Date(dt * 1000);
    const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

    return new Weather(name, date, iconUrl, description, temp, humidity, speed);
  }

  // TODO: Create parseForecastData method
  private parseForecastData(response: any): Weather[] {
    const forecastArray: Weather[] = [];
    const dailyData = response.list.filter((_: any, index: number) => index % 8 === 0);

    dailyData.forEach((data: any) => {
      const {
        main: { temp, humidity },
        weather: [{ icon, description }],
        wind: { speed },
        dt,
      } = data;

      const date = new Date(dt * 1000);
      const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

      forecastArray.push(new Weather(response.city.name, date, iconUrl, description, temp, humidity, speed));
    });

    return forecastArray;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(this.cityName);
    if (!locationData || locationData.length === 0) {
      throw new Error(`No location data found for city: ${this.cityName}`);
    }
    return this.destructureLocationData(locationData);
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<{ currentWeather: Weather, forecast: Weather[] }> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();

    const currentWeatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(currentWeatherData);

    const forecastData = await this.fetchForecastData(coordinates);
    const forecast = this.parseForecastData(forecastData);

    return { currentWeather, forecast };
  }
}
export default new WeatherService();