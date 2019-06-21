using System;
using System.Threading.Tasks;

namespace Nozomi
{
    public abstract partial class BaseRequestHandler
    {
        protected abstract Task<TResp> Handle<TReq, TResp>(
            string method,
            string path,
            TReq req
        );
    }
}
