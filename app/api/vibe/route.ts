import { NextRequest, NextResponse } from "next/server";
import { CITIES } from "@/lib/cities";
import { calculateVibe, WeatherData, EventsData, AQIData } from "@/lib/vibeEngine";

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();
  return {
    temp: data.main.temp,
    feels_like: data.main.feels_like,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
  };
}

async function fetchEvents(lat: number, lon: number): Promise<EventsData> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?latlong=${lat},${lon}&radius=20&unit=miles&startDateTime=${today}T00:00:00Z&endDateTime=${tomorrow}T23:59:59Z&apikey=${apiKey}&size=10`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return { count: 0, topEvents: [] };
    const data = await res.json();
    const events = data._embedded?.events || [];
    return {
      count: data.page?.totalElements || events.length,
      topEvents: events.slice(0, 3).map((e: { name: string }) => e.name),
    };
  } catch {
    return { count: 0, topEvents: [] };
  }
}

async function fetchAQI(lat: number, lon: number): Promise<AQIData> {
  const apiKey = process.env.AQICN_API_KEY;
  const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return { aqi: 50, category: "Good" };
    const data = await res.json();
    const aqi = data.data?.aqi || 50;

    let category = "Good";
    if (aqi > 300) category = "Hazardous";
    else if (aqi > 200) category = "Very Unhealthy";
    else if (aqi > 150) category = "Unhealthy";
    else if (aqi > 100) category = "Unhealthy for Sensitive Groups";
    else if (aqi > 50) category = "Moderate";

    return { aqi, category };
  } catch {
    return { aqi: 50, category: "Good" };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cityName = searchParams.get("city");

  if (!cityName) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

  const city = CITIES.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  );

  if (!city) {
    return NextResponse.json({ error: "City not found" }, { status: 404 });
  }

  try {
    const [weather, events, aqi] = await Promise.all([
      fetchWeather(city.lat, city.lon),
      fetchEvents(city.lat, city.lon),
      fetchAQI(city.lat, city.lon),
    ]);

    const vibe = calculateVibe(city.name, weather, events, aqi);

    return NextResponse.json({
      city: { name: city.name, state: city.state },
      vibe,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Vibe fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vibe data" },
      { status: 500 }
    );
  }
}
