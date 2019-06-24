using System;
#if USE_MSGPACK
using MessagePack;
#endif

namespace Nozomi
{
    [Serializable]
#if USE_MSGPACK
    [MessagePackObject(true)]
#endif
    public class ErrorResponse
    {
        public string message;
        public long status;
        public int code;
        public string name;
    }
}
