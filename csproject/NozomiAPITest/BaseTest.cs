using Nozomi;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace NozomiTest
{
    public class BaseTest
    {
        public readonly string AuthToken = "1234567890ABCDEF";
        public readonly string BaseAddress = "http://127.0.0.1:12396";

        public DevRequestHandler makeHandler(IContentSerializer requestSerializer, IContentSerializer responseSerializer, string AuthToken = null)
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Add("User-Agent", "TestAgent");

            var nozomi = new NozomiClient(client, BaseAddress, requestSerializer, responseSerializer);
            if (AuthToken != null)
            {
                nozomi.client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AuthToken);
            }
            var requestHandler = new DevRequestHandler(nozomi);
            return requestHandler;
        }

        public class DevRequestHandler : Nozomi.Dev.BaseRequestHandler
        {
            NozomiClient nozomi;
            public DevRequestHandler(NozomiClient nozomi)
            {
                this.nozomi = nozomi;
            }

            protected override async Task<TResp> Handle<TReq, TResp>(string method, string path, TReq req)
            {
                using (var message = new HttpRequestMessage(new HttpMethod(method), $"{nozomi.baseAddress}{path}"))
                using (var httpReq = new SimpleRequest(nozomi.client, message, nozomi.requestSerializer, nozomi.responseSerializer))
                {
                    return await httpReq.Request<TReq, TResp>(req);
                }
            }
        }
    }
}
