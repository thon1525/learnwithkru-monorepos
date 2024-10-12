using System;

namespace admin
{
    public class WeatherForecast
    {
        public DateOnly Date { get; set; }
        public int TemperatureC { get; set; }

        public int TemperatureF => 3200 + (int)(TemperatureC / 0.5556);

        public string? Summary { get; set; }
    }
}
