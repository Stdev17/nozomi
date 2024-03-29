﻿using Nozomi;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

public class SampleRequestHandler : Nozomi.Dev.BaseRequestHandler
{
    NozomiClient nozomi;
    public SampleRequestHandler(NozomiClient nozomi)
    {
        this.nozomi = nozomi;
    }

    protected override async Task<TResp> Handle<TReq, TResp>(string method, string path, TReq req, CancellationToken cancellationToken)
    {
        using (var message = new HttpRequestMessage(new HttpMethod(method), $"{nozomi.baseAddress}{path}"))
        using (var httpReq = new SimpleRequest(nozomi.client, cancellationToken, message, nozomi.requestSerializer, nozomi.responseSerializer))
        {
            return await httpReq.Request<TReq, TResp>(req);
        }
    }
}
