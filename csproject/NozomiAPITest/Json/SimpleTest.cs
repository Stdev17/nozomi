using Nozomi;
using Nozomi.Dev;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

using System.Net.Http;

namespace NozomiTest.Json
{
    [TestClass]
    public class SimpleTest : BaseSimpleTest
    {
        DevRequestHandler handler => makeHandler(
            JsonContentSerializer.Default,
            JsonContentSerializer.Default
        );

        [TestMethod]
        public async Task NozomiSimpleGetTest()
        {
            await NozomiSimpleGetTest(handler);
        }
        [TestMethod]
        public async Task NozomiSimplePostTest()
        {
            await NozomiSimplePostTest(handler);
        }
        [TestMethod]
        public async Task NozomiSimplePutTest()
        {
            await NozomiSimplePutTest(handler);
        }
        [TestMethod]
        public async Task NozomiSimpleDeleteTest()
        {
            await NozomiSimpleDeleteTest(handler);
        }
    }
}
