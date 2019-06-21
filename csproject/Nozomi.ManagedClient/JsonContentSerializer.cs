using System;
using System.IO;
using System.Text;
using System.Net.Http;
using System.Threading.Tasks;

using Fiveminlab.Newtonsoft.Json;

namespace Nozomi
{
    public class JsonContentSerializer : IContentSerializer
    {
        public string ContentType => "application/json";

        private readonly JsonSerializer _serializer;

        public JsonSerializerSettings Settings { get; }

        public JsonContentSerializer(JsonSerializerSettings settings = null)
        {
            Settings = settings;
            _serializer = JsonSerializer.Create(settings);
        }

        public Task<HttpContent> SerializeAsync<T>(object data)
        {
            if (data == null)
            {
                return null;
            }

            string json;

            using (var writer = new StringWriter())
            using (var jsonWriter = new JsonTextWriter(writer))
            {
                _serializer.Serialize(jsonWriter, data);
                jsonWriter.Flush();

                json = writer.ToString();
            }

            var content = new StringContent(json, Encoding.UTF8, ContentType);
            return Task.FromResult<HttpContent>(content);
        }

        public async Task<T> DeserializeAsync<T>(HttpContent content)
        {
            using (var s = await content.ReadAsStreamAsync().ConfigureAwait(false))
            using (var sr = new StreamReader(s))
            {
                return (T)_serializer.Deserialize(sr, typeof(T));
            }
        }

        public static readonly Lazy<JsonContentSerializer> _current = new Lazy<JsonContentSerializer>(() => new JsonContentSerializer());
        public static JsonContentSerializer Default => _current.Value;

    }
}
