using Nozomi;
using Nozomi.Dev;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace NozomiTest
{
    public class BaseLiteralTest : BaseTest
    {
        public async Task NozomiStringLiteralGetTest(DevRequestHandler handler)
        {
            var result = await handler.NozomiStringLiteralGet(new NozomiStringLiteralGet.Req
            {
                s = "s"
            });

            Assert.AreEqual("s", result.s);
        }
        public async Task NozomiBooleanLiteralGetTest(DevRequestHandler handler)
        {
            var result = await handler.NozomiBooleanLiteralGet(new NozomiBooleanLiteralGet.Req
            {
                b = true
            });

            Assert.AreEqual(true, result.b);
        }
        public async Task NozomiNumberLiteralGetTest(DevRequestHandler handler)
        {
            var result = await handler.NozomiNumberLiteralGet(new NozomiNumberLiteralGet.Req
            {
                n = 1
            });

            Assert.AreEqual(1, result.n);
        }
    }
}
