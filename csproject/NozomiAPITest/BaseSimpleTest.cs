using Nozomi;
using Nozomi.Dev;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace NozomiTest
{
    public class BaseSimpleTest : BaseTest
    {
        public async Task NozomiSimpleGetTest(DevRequestHandler handler)
        {
            var result = await handler.NozomiSimpleGet(new NozomiSimpleGet.Req
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
        public async Task NozomiSimplePostTest(DevRequestHandler handler)
        {
            var result = await handler.NozomiSimplePost(new NozomiSimplePost.Req
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
        public async Task NozomiSimplePutTest(DevRequestHandler handler)
        {
            var result = await handler.NozomiSimplePut(new NozomiSimplePut.Req
            {
                n = 13243546,
                s = "String",
                b = true,
            });

            Assert.AreEqual(13243546, result.num);
            Assert.AreEqual("String", result.str);
            Assert.AreEqual(true, result.bool_flag);
            Assert.AreEqual("PUT", result.method);
        }
        public async Task NozomiSimpleDeleteTest(DevRequestHandler handler)
        {
            var result = await handler.NozomiSimpleDelete(new NozomiSimpleDelete.Req
            {
                n = 13243546,
                s = "String",
                b = true,
            });

            Assert.AreEqual(13243546, result.num);
            Assert.AreEqual("String", result.str);
            Assert.AreEqual(true, result.bool_flag);
            Assert.AreEqual("DELETE", result.method);
        }
    }
}
