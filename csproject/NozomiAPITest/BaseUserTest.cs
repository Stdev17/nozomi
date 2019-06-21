using Nozomi;
using Nozomi.Dev;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace NozomiTest
{
    public class BaseUserTest : BaseTest
    {
        public async Task NozomiUserGetTest(DevRequestHandler handler)
        {
            var result = await handler.NozomiUserGet(new NozomiUserGet.Req
            {
                n = 13243546,
                s = "String",
                b = true,
            });

            Assert.AreEqual(13243546, result.num);
            Assert.AreEqual("String", result.str);
            Assert.AreEqual(true, result.bool_flag);
            Assert.AreEqual("GET", result.method);
        }
        public async Task NozomiUserPostTest(DevRequestHandler handler)
        {
            var result = await handler.NozomiUserPost(new NozomiUserPost.Req
            {
                n = 13243546,
                s = "String",
                b = true,
            });

            Assert.AreEqual(13243546, result.num);
            Assert.AreEqual("String", result.str);
            Assert.AreEqual(true, result.bool_flag);
            Assert.AreEqual("POST", result.method);
        }
    }
}
