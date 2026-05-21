import { useEffect, useState } from 'react';

export function useIpWeather() {
  const [weatherText, setWeatherText] = useState('--°F');

  useEffect(() => {
    let cancelled = false;

    const loadWeather = async () => {
      const apis = ['https://ipapi.co/json/', 'https://ip-api.com/json/?fields=lat,lon', 'https://ipwho.is/'];

      let latitude = null;
      let longitude = null;

      for (const api of apis) {
        try {
          const res = await fetch(api);
          if (!res.ok) {
            continue;
          }

          const data = await res.json();
          const lat = Number(data.latitude ?? data.lat);
          const lon = Number(data.longitude ?? data.lon);

          if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
            latitude = lat;
            longitude = lon;
            break;
          }
        } catch {
          continue;
        }
      }

      if (latitude === null || longitude === null) {
        if (!cancelled) {
          setWeatherText('N/A');
        }
        return;
      }

      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&temperature_unit=fahrenheit`
        );

        if (!weatherRes.ok) {
          throw new Error('Weather fetch failed');
        }

        const weatherData = await weatherRes.json();
        const temperature = weatherData?.current?.temperature_2m;

        if (typeof temperature !== 'number') {
          throw new Error('No temperature');
        }

        if (!cancelled) {
          setWeatherText(`${Math.round(temperature)}°F`);
        }
      } catch {
        if (!cancelled) {
          setWeatherText('N/A');
        }
      }
    };

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  return weatherText;
}
