using Nozomi;
using Nozomi.Dev;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

using System.Net.Http;

namespace NozomiTest.Json
{
    [TestClass]
    public class LiteralTest : BaseLiteralTest
    {
        DevRequestHandler handler => makeHandler(
            JsonContentSerializer.Default,
            JsonContentSerializer.Default
        );

        [TestMethod]
        public async Task NozomiStringLiteralGetTest()
        {
            await NozomiStringLiteralGetTest(handler);
        }
        [TestMethod]
        public async Task NozomiBooleanLiteralGetTest()
        {
            await NozomiBooleanLiteralGetTest(handler);
        }
        [TestMethod]
        public async Task NozomiNumberLiteralGetTest()
        {
            await NozomiNumberLiteralGetTest(handler);
        }
    }
}
