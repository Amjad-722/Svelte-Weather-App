import {
	WeatherIcon,
	type ExtraInfo,
	type FutureForecast,
	type TimeForecast,
	type WeatherAPIResponse
} from '$lib/types';

export class DataParser {
	getOverview(apiResponse: WeatherAPIResponse | undefined) {
		return {
			humidity: apiResponse?.current?.humidity ?? 0,
			temperature: apiResponse?.current?.temp_c ?? 0,
			city: apiResponse?.location?.name ?? '',
			icon: this.getWeatherIcon(apiResponse)
		};
	}

	getExtra(apiResponse: WeatherAPIResponse | undefined): ExtraInfo {
		return {
			realFeel: apiResponse?.current?.feelslike_c ?? 0,
			windSpeed: apiResponse?.current?.wind_kph ?? 0,
			rainChance: apiResponse?.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain ?? 0,
			UVIndex: apiResponse?.current?.uv ?? 0
		};
	}

	getFutureForecast(apiResponse: WeatherAPIResponse | undefined): FutureForecast[] {
		const result: FutureForecast[] = [];
		const apiForecast = apiResponse?.forecast?.forecastday ?? [];

		for (const el of apiForecast) {
			result.push({
				day: this.formatDateToDayMonth(el.date),
				dayName: this.getDayOfWeek(el.date),
				weather: el.day?.condition?.text ?? '',
				icon: this.getWeatherIcon(apiResponse)
			});
		}

		return result;
	}

	// The API we are using does not have an hourly forecast, so we generate fake data
	getTimeForecast(apiResponse: WeatherAPIResponse | undefined): TimeForecast[] {
		const result: TimeForecast[] = [];
		const current_temp = apiResponse?.current?.temp_c ?? 0;

		for (let i = 6; i < 11; ++i) {
			result.push({
				time: i + ':00am',
				temperature: current_temp + Math.random() * 4 - 2,
				icon: this.getWeatherIcon(undefined, true)
			});
		}

		return result;
	}

	private getDayOfWeek(dateString: string): string {
		const date = new Date(dateString);
		const daysOfWeek = [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday'
		];
		const dayIndex = date.getDay();
		return daysOfWeek[dayIndex];
	}

	private formatDateToDayMonth(dateString: string): string {
		const [_, month, day] = dateString.split('-');
		return `${day}/${month}`;
	}

	private getWeatherIcon(apiResponse: WeatherAPIResponse | undefined, random = false): WeatherIcon {
		if (random) {
			const values = Object.values(WeatherIcon);
			const icon = values[Math.floor(Math.random() * values.length)];
			return icon;
		} else if (apiResponse) {
			if (apiResponse.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain ?? 0 > 50) {
				return WeatherIcon.Rainy;
			} else if (apiResponse.current?.cloud ?? 0 > 50) {
				return WeatherIcon.Cloudy;
			} else {
				return WeatherIcon.Sunny;
			}
		}

		return WeatherIcon.Sunny;
	}
}
