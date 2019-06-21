using System;
using System.Collections.Generic;
using Fiveminlab.Newtonsoft.Json;

namespace Nozomi
{
    public static class UrlHelpers
    {
        static IContentSerializer serializer = new JsonContentSerializer();
        public static string ToQueryString(this object model)
        {
            var serialized = serializer.SerializeAsync<object>(model).Result;
            var deserialized = serializer.DeserializeAsync<Dictionary<string, string>>(serialized).Result;
            var result = String.Empty;

            var first = true;
            foreach (var pair in deserialized)
            {
                if (first)
                {
                    first = false;
                    result += "?";
                } else
                {
                    result += "&";
                }
                result += pair.Key + "=" + pair.Value;
            }
            return result;
        }
    }
}
