using System.Net.Http;
using System.Threading.Tasks;

namespace Nozomi
{
    public interface IContentSerializer
    {
        string ContentType { get; }

        Task<HttpContent> SerializeAsync<TData>(object data);
        Task<TData> DeserializeAsync<TData>(HttpContent content);
    }
}
