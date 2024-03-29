using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Runtime.Serialization;

using Fiveminlab.Newtonsoft.Json;
using Fiveminlab.Newtonsoft.Json.Converters;

#if USE_MSGPACK
using MessagePack;
#endif

namespace Nozomi
{
    public class EnumType
    {
#if USE_MSGPACK
        [MessagePackObject]
#endif
        public class EnumObj
        {
            readonly string _value;
            public EnumObj()
            {

            }
            public EnumObj(string value)
            {
                this._value = value;
            }
            public override string ToString()
            {
                return this._value;
            }
            public static implicit operator string(EnumObj d)
            {
                return d._value;
            }
            public static implicit operator EnumObj(string d)
            {
                return new EnumObj(d);
            }

            public static EnumObj A = new EnumObj("A");
            public static EnumObj B = new EnumObj("B");
            public static EnumObj C = new EnumObj("C");
            public static EnumObj D = new EnumObj("D");

            public static EnumObj Get(string key)
            {
                switch (key)
                {
                    case "A":
                        return A;
                    case "B":
                        return B;
                    case "C":
                        return C;
                    case "D":
                        return D;
                    default:
                        throw new InvalidOperationException("Enum invalid operator");
                }
            }
        }
#if USE_MSGPACK
        [MessagePackObject]
#endif
        public class EnumObjInit
        {
            readonly string _value;
            public EnumObjInit()
            {

            }
            public EnumObjInit(string value)
            {
                this._value = value;
            }
            public override string ToString()
            {
                return this._value;
            }
            public static implicit operator string(EnumObjInit d)
            {
                return d._value;
            }
            public static implicit operator EnumObjInit(string d)
            {
                return new EnumObjInit(d);
            }

            public static EnumObjInit A = new EnumObjInit("1");
            public static EnumObjInit B = new EnumObjInit("string");

            public static EnumObjInit Get(string key)
            {
                switch (key)
                {
                    case "1":
                        return A;
                    case "string":
                        return B;
                    default:
                        throw new InvalidOperationException("Enum invalid operator");
                }
            }
        }
#if USE_MSGPACK
        [MessagePackObject]
#endif
        public class Req
        {
#if USE_MSGPACK
            [IgnoreMember]
#endif
            [JsonIgnore]
            public EnumObj enumObj
            {
                get
                {
                    return EnumObj.Get(__raw_enumObj);
                }
                set
                {
                    __raw_enumObj = value.ToString();
                }
            }

#if USE_MSGPACK
            [KeyAttribute("enumObj")]
#endif
            [JsonProperty("enumObj")]
            public string __raw_enumObj;
#if USE_MSGPACK
            [IgnoreMember]
#endif
            [JsonIgnore]
            public EnumObjInit enumObjInit
            {
                get
                {
                    return EnumObjInit.Get(__raw_enumObjInit);
                }
                set
                {
                    __raw_enumObjInit = value.ToString();
                }
            }

#if USE_MSGPACK
            [KeyAttribute("enumObjInit")]
#endif
            [JsonProperty("enumObjInit")]
            public string __raw_enumObjInit;
        }
#if USE_MSGPACK
        [MessagePackObject]
#endif
        public class Resp
        {
        }
    }

    public partial class BaseRequestHandler
    {
        public virtual async Task<EnumType.Resp> EnumType(EnumType.Req req)
        {
            var method = "GET";
            var path = "/sample/api";
            var task = await Handle<EnumType.Req, EnumType.Resp>(method, path, req);
            return task;
        }
    }
}
