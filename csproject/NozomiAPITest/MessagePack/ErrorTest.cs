using Nozomi;
using Nozomi.Dev;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace NozomiTest.MessagePack
{
    [TestClass]
    public class ErrorTest : BaseErrorTest
    {
        DevRequestHandler handler => makeHandler(
            JsonContentSerializer.Default, 
            MessagePackContentSerializer.Default
        );

        [TestMethod]
        public void NozomiSampleError()
        {
            NozomiSampleError(handler);
        }
    }
}
