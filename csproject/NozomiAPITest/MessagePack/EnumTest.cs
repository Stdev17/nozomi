using Nozomi;
using Nozomi.Dev;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace NozomiTest.MessagePack
{
    [TestClass]
    public class EnumTest : BaseEnumTest
    {
        DevRequestHandler handler => makeHandler(
            JsonContentSerializer.Default,
            MessagePackContentSerializer.Default
        );

        [TestMethod]
        public async Task NozomiStringEnumGetTest()
        {
            await NozomiStringEnumGetTest(handler);
        }

        [TestMethod]
        public async Task NozomiStringEnumPostTest()
        {
            await NozomiStringEnumPostTest(handler);
        }

        [TestMethod]
        public async Task NozomiStringEnumPutTest()
        {
            await NozomiStringEnumPutTest(handler);
        }

        [TestMethod]
        public async Task NozomiStringEnumDeleteTest()
        {
            await NozomiStringEnumDeleteTest(handler);
        }
    }
}
