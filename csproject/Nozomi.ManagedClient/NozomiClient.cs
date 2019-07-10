using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Nozomi
{
    public class NozomiClient
    {
        public string baseAddress;

        public readonly HttpClient client;
        public IContentSerializer requestSerializer;
        public IContentSerializer responseSerializer;

        public NozomiClient(HttpClient client, string baseAddress, IContentSerializer requestSerializer, IContentSerializer responseSerializer)
        {
            this.client = client ?? throw new ArgumentNullException(nameof(client));
            this.baseAddress = baseAddress ?? throw new ArgumentNullException(nameof(baseAddress));
            this.requestSerializer = requestSerializer ?? throw new ArgumentNullException(nameof(requestSerializer));
            this.responseSerializer = responseSerializer ?? throw new ArgumentNullException(nameof(responseSerializer));
        }

        public async Task<TResp> Handle<TReq, TResp>(string method, string path, TReq req, CancellationToken cancellationToken)
        {
            using (var message = new HttpRequestMessage(new HttpMethod(method), $"{baseAddress}{path}"))
            using (var httpReq = new SimpleRequest(client, message, cancellationToken, requestSerializer, responseSerializer))
            {
                return await httpReq.Request<TReq, TResp>(req);
            }
        }
    }
}
