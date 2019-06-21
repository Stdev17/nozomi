using System;
using MessagePack;

namespace Nozomi
{
    [Serializable]
    [MessagePackObject(true)]
    public class ErrorResponse
    {
        public string message;
        public long status;
        public int code;
        public string name;
    }
}
