using System;

namespace Nozomi
{
    public class HttpException : Exception
    {
        public readonly long status;
        public readonly int code;
        public readonly string name;
        public string message
        {
            get { return base.Message; }
        }

        public HttpException(string message, long status, int code, string name)
            : base(message)
        {
            this.status = status;
            this.code = code;
            this.name = name;
        }
    }

    public class TokenExpireException : HttpException
    {
        public TokenExpireException(string message, long status, int code, string name)
            : base(message, status, code, name)
        {
        }
    }

    public class ServerException : HttpException
    {
        public ServerException(string message, long status, int code, string name) : base(message, status, code, name)
        {
        }
    }
}
