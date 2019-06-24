using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

#if USE_MSGPACK
using MessagePack;
#endif

namespace Nozomi
{
    public class MessagePackContentSerializer : IContentSerializer
    {
        public string ContentType => "application/x-msgpack";

        public Task<HttpContent> SerializeAsync<T>(object data)
        {
#if USE_MSGPACK
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
#else
            throw new NotSupportedException();
#endif
        }

        public async Task<T> DeserializeAsync<T>(HttpContent content)
        {
#if USE_MSGPACK
            using (var s = await content.ReadAsStreamAsync().ConfigureAwait(false))
            {
                return MessagePackSerializer.Deserialize<T>(s);
            }
#else
            throw new NotSupportedException();
#endif
        }
        public static readonly Lazy<JsonContentSerializer> _current = new Lazy<JsonContentSerializer>(() => new JsonContentSerializer());
        public static JsonContentSerializer Default => _current.Value;

    }
}

