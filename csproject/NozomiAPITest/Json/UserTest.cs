using Nozomi;
using Nozomi.Dev;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

using System.Net.Http;
using System.Net.Http.Headers;

namespace NozomiTest.Json
{
    [TestClass]
    public class UserTest : BaseUserTest
    {
        DevRequestHandler handler => makeHandler(
            JsonContentSerializer.Default,
            JsonContentSerializer.Default,
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
