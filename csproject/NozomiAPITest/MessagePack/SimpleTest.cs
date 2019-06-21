using Nozomi;
using Nozomi.Dev;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace NozomiTest.MessagePack
{
    [TestClass]
    public class SimpleTest : BaseSimpleTest
    {
        DevRequestHandler handler => makeHandler(
            JsonContentSerializer.Default,
            MessagePackContentSerializer.Default
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
