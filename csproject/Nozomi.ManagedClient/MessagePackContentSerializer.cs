using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

using MessagePack;

namespace Nozomi
{
    public class MessagePackContentSerializer : IContentSerializer
    {
        public string ContentType => "application/x-msgpack";

        public Task<HttpContent> SerializeAsync<T>(object data)
        {
            if (data == null)
            {
                return null;
            }

            byte[] bin;

            using (var stream = new MemoryStream())
            {
                MessagePackSerializer.Serialize(stream, (T)data);
                stream.Flush();

                bin = stream.GetBuffer();
            }

            var content = new ByteArrayContent(bin);
            return Task.FromResult<HttpContent>(content);
        }

        public async Task<T> DeserializeAsync<T>(HttpContent content)
        {
            using (var s = await content.ReadAsStreamAsync().ConfigureAwait(false))
            {
                return MessagePackSerializer.Deserialize<T>(s);
            }
        }
        public static readonly Lazy<JsonContentSerializer> _current = new Lazy<JsonContentSerializer>(() => new JsonContentSerializer());
        public static JsonContentSerializer Default => _current.Value;

    }
}
