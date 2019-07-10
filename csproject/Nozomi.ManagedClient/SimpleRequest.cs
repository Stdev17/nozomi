using System;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;

namespace Nozomi
{
    public class SimpleRequest : IDisposable
    {
        HttpClient Client { get; }
        HttpRequestMessage Message { get; set; }
        IContentSerializer RequestSerializer { get; set; }
        IContentSerializer ResponseSerializer { get; set; }
        CancellationToken CancellationToken { get; set; }

        public SimpleRequest(
            HttpClient client,
            HttpRequestMessage message,
            CancellationToken cancellationToken,
            IContentSerializer requestSerializer,
            IContentSerializer responseSerializer
        )
        {
            Client = client;
            Message = message;
            CancellationToken = cancellationToken;
            RequestSerializer = requestSerializer;
            ResponseSerializer = responseSerializer;

            client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue(ResponseSerializer.ContentType));
        }

        public async Task<TResp> Request<TResp>()
        {
            using (var response = await Client.SendAsync(Message, CancellationToken))
            {
                return await GetResponse<TResp>(response);
            }
        }

        public async Task<string> Request()
        {
            using (var response = await Client.SendAsync(Message, CancellationToken))
            {
                return await response.Content.ReadAsStringAsync();
            }
        }

        public async Task<TResp> Request<TReq, TResp>(TReq req)
        {
            if (Message.Method == HttpMethod.Get)
            {
                var querystring = req.ToQueryString();
                Message.RequestUri = new Uri(Message.RequestUri.ToString() + querystring);
            }
            else
            {
                Message.Content = await RequestSerializer.SerializeAsync<TReq>(req);
                var body = await Message.Content.ReadAsStringAsync();
            }
            using (var response = await Client.SendAsync(Message, CancellationToken))
            {
                return await GetResponse<TResp>(response);
            }
        }

        private async Task HandleError(HttpResponseMessage response)
        {
            var res = await ResponseSerializer.DeserializeAsync<ErrorResponse>(response.Content);

            if (res == null)
            {
                throw new ServerException(
                    response.ReasonPhrase,
                    (int)response.StatusCode,
                    -1,
                    ""
                );
            }
            else if ((int)response.StatusCode == 500)
            {
                throw new ServerException(
                    response.ReasonPhrase,
                    (int)response.StatusCode,
                    res.code,
                    res.name
                );
            }
            else if (res.code == 102)
            {
                throw new TokenExpireException(
                    res.message,
                    (int)response.StatusCode,
                    res.code,
                    res.name
                );
            }
            else
            {
                throw new HttpException(
                    res.message,
                    (int)response.StatusCode,
                    res.code,
                    res.name
                );
            }
        }

        private async Task<TResp> GetResponse<TResp>(HttpResponseMessage response)
        {
            if (!response.IsSuccessStatusCode)
                await HandleError(response);

            var resp = await ResponseSerializer.DeserializeAsync<TResp>(response.Content);
            return resp;
        }
        public void Dispose()
        {
        }
    }
}
