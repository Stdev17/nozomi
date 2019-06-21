using Nozomi;
using Nozomi.Dev;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace NozomiTest.MessagePack
{
    [TestClass]
    public class UserTest : BaseUserTest
    {
        DevRequestHandler handler => makeHandler(
            JsonContentSerializer.Default,
            MessagePackContentSerializer.Default,
            AuthToken
        );

        [TestMethod]
        public async Task NozomiUserGetTest()
        {
            await NozomiUserGetTest(handler);
        }
        [TestMethod]
        public async Task NozomiUserPostTest()
        {
            await NozomiUserPostTest(handler);
        }
    }
}
