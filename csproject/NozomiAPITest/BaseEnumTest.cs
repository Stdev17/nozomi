using Nozomi;
using Nozomi.Dev;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace NozomiTest
{
    public class BaseEnumTest : BaseTest
    {
        public async Task NozomiStringEnumGetTest(DevRequestHandler handler)
        {
            var result = await handler.NozomiStringEnumGet(new NozomiStringEnumGet.Req
            {
                a = NozomiStringEnumGet.A.Apple,
                g = NozomiStringEnumGet.A.Google,
                m = NozomiStringEnumGet.A.Microsoft,
                s = NozomiStringEnumGet.A.Samsung,
            });
            Assert.AreEqual("GET", result.method);
            Assert.AreEqual(NozomiStringEnumGet.A.Apple, result.Apple);
            Assert.AreEqual(NozomiStringEnumGet.A.Google, result.Google);
            Assert.AreEqual(NozomiStringEnumGet.A.Microsoft, result.Microsoft);
            Assert.AreEqual(NozomiStringEnumGet.A.Samsung, result.Samsung);
        }
        public async Task NozomiStringEnumPostTest(DevRequestHandler handler)
        {
            var result = await nozomi.NozomiStringEnumPost(new NozomiStringEnumPost.Req
            {
                a = NozomiStringEnumPost.A.Apple,
                g = NozomiStringEnumPost.A.Google,
                m = NozomiStringEnumPost.A.Microsoft,
                s = NozomiStringEnumPost.A.Samsung,
            });
            Assert.AreEqual("POST", result.method);
            Assert.AreEqual(NozomiStringEnumPost.A.Apple, result.Apple);
            Assert.AreEqual(NozomiStringEnumPost.A.Google, result.Google);
            Assert.AreEqual(NozomiStringEnumPost.A.Microsoft, result.Microsoft);
            Assert.AreEqual(NozomiStringEnumPost.A.Samsung, result.Samsung);
        }
        public async Task NozomiStringEnumPutTest(DevRequestHandler handler)
        {
            var result = await nozomi.NozomiStringEnumPut(new NozomiStringEnumPut.Req
            {
                a = NozomiStringEnumPut.A.Apple,
                g = NozomiStringEnumPut.A.Google,
                m = NozomiStringEnumPut.A.Microsoft,
                s = NozomiStringEnumPut.A.Samsung,
            });
            Assert.AreEqual("PUT", result.method);
            Assert.AreEqual(NozomiStringEnumPut.A.Apple, result.Apple);
            Assert.AreEqual(NozomiStringEnumPut.A.Google, result.Google);
            Assert.AreEqual(NozomiStringEnumPut.A.Microsoft, result.Microsoft);
            Assert.AreEqual(NozomiStringEnumPut.A.Samsung, result.Samsung);
        }
        public async Task NozomiStringEnumDeleteTest(DevRequestHandler handler)
        {
            var result = await nozomi.NozomiStringEnumDelete(new NozomiStringEnumDelete.Req
            {
                a = NozomiStringEnumDelete.A.Apple,
                g = NozomiStringEnumDelete.A.Google,
                m = NozomiStringEnumDelete.A.Microsoft,
                s = NozomiStringEnumDelete.A.Samsung,
            });
            Assert.AreEqual("DELETE", result.method);
            Assert.AreEqual(NozomiStringEnumDelete.A.Apple, result.Apple);
            Assert.AreEqual(NozomiStringEnumDelete.A.Google, result.Google);
            Assert.AreEqual(NozomiStringEnumDelete.A.Microsoft, result.Microsoft);
            Assert.AreEqual(NozomiStringEnumDelete.A.Samsung, result.Samsung);
        }
    }
}
