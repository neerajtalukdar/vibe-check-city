export interface WeatherData {
  temp: number;
  feels_like: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
}

export interface EventsData {
  count: number;
  topEvents: string[];
}

export interface AQIData {
  aqi: number;
  category: string;
}

export interface VibeResult {
  score: number; // 0-100
  emoji: string;
  label: string;
  summary: string;
  factors: {
    weather: { score: number; note: string };
    events: { score: number; note: string };
    air: { score: number; note: string };
  };
  weather: WeatherData;
  events: EventsData;
  aqi: AQIData;
}

function getWeatherScore(weather: WeatherData): { score: number; note: string } {
  let score = 50;
  const desc = weather.description.toLowerCase();

  if (desc.includes("clear") || desc.includes("sunny")) score += 30;
  else if (desc.includes("cloud") && !desc.includes("overcast")) score += 15;
  else if (desc.includes("overcast")) score += 5;
  else if (desc.includes("rain") || desc.includes("drizzle")) score -= 10;
  else if (desc.includes("storm") || desc.includes("thunder")) score -= 25;
  else if (desc.includes("snow")) score += 10;
  else if (desc.includes("fog") || desc.includes("mist")) score -= 5;

  const temp = weather.temp;
  if (temp >= 65 && temp <= 80) score += 20;
  else if (temp >= 55 && temp < 65) score += 10;
  else if (temp >= 80 && temp <= 90) score += 5;
  else if (temp > 90 || temp < 32) score -= 20;
  else if (temp < 40) score -= 10;

  score = Math.max(0, Math.min(100, score));

  const note =
    score >= 70
      ? `${weather.description}, ${Math.round(temp)}°F — perfect out there`
      : score >= 45
      ? `${weather.description}, ${Math.round(temp)}°F — not bad`
      : `${weather.description}, ${Math.round(temp)}°F — stay cozy`;

  return { score, note };
}

function getEventsScore(events: EventsData): { score: number; note: string } {
  let score = 30;
  if (events.count >= 20) score = 90;
  else if (events.count >= 10) score = 75;
  else if (events.count >= 5) score = 60;
  else if (events.count >= 2) score = 45;
  else if (events.count === 1) score = 35;

  const note =
    events.count === 0
      ? "Quiet day, not much going on"
      : events.count === 1
      ? `1 event: ${events.topEvents[0]}`
      : `${events.count} events happening — ${events.topEvents[0]} and more`;

  return { score, note };
}

function getAQIScore(aqi: AQIData): { score: number; note: string } {
  let score = 50;
  if (aqi.aqi <= 50) score = 95;
  else if (aqi.aqi <= 100) score = 75;
  else if (aqi.aqi <= 150) score = 50;
  else if (aqi.aqi <= 200) score = 25;
  else score = 10;

  const note = `Air quality: ${aqi.category} (AQI ${aqi.aqi})`;
  return { score, note };
}

function getVibeLabel(score: number): { emoji: string; label: string } {
  if (score >= 85) return { emoji: "🔥", label: "Absolutely Buzzing" };
  if (score >= 70) return { emoji: "✨", label: "Good Vibes Only" };
  if (score >= 55) return { emoji: "😌", label: "Chill & Decent" };
  if (score >= 40) return { emoji: "😐", label: "Meh, It's Fine" };
  if (score >= 25) return { emoji: "😶‍🌫️", label: "Low Energy Day" };
  return { emoji: "💀", label: "Dead Energy" };
}

function generateSummary(
  cityName: string,
  score: number,
  wf: { score: number; note: string },
  ef: { score: number; note: string },
  af: { score: number; note: string }
): string {
  const { label } = getVibeLabel(score);
  const topFactor =
    wf.score >= ef.score && wf.score >= af.score
      ? "weather"
      : ef.score >= wf.score && ef.score >= af.score
      ? "events"
      : "air quality";

  if (score >= 70) {
    return `${cityName} is ${label.toLowerCase()} today. The ${topFactor} is carrying hard — get outside.`;
  } else if (score >= 45) {
    return `${cityName} is giving a solid ${label.toLowerCase()} energy. Nothing to complain about, nothing to brag about.`;
  } else {
    return `${cityName} is in a ${label.toLowerCase()} mood today. Blame the ${topFactor}.`;
  }
}

export function calculateVibe(
  cityName: string,
  weather: WeatherData,
  events: EventsData,
  aqi: AQIData
): VibeResult {
  const wf = getWeatherScore(weather);
  const ef = getEventsScore(events);
  const af = getAQIScore(aqi);

  // Weighted average: weather 40%, events 35%, air 25%
  const score = Math.round(wf.score * 0.4 + ef.score * 0.35 + af.score * 0.25);
  const { emoji, label } = getVibeLabel(score);
  const summary = generateSummary(cityName, score, wf, ef, af);

  return {
    score,
    emoji,
    label,
    summary,
    factors: {
      weather: wf,
      events: ef,
      air: af,
    },
    weather,
    events,
    aqi,
  };
}
