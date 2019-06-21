using Nozomi;
using Nozomi.Dev;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace NozomiTest.Json
{
    [TestClass]
    public class ErrorTest : BaseErrorTest
    {
        DevRequestHandler handler => makeHandler(
            JsonContentSerializer.Default,
            JsonContentSerializer.Default
        );

        [TestMethod]
        public void NozomiSampleError()
        {
            NozomiSampleError(handler);
        }
    }
}
