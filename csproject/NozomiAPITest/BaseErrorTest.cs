using Nozomi;
using Nozomi.Dev;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace NozomiTest
{
    public class BaseErrorTest : BaseTest
    {
        public void NozomiSampleError(DevRequestHandler handler)
        {
            var ex = Assert.ThrowsExceptionAsync<HttpException>(async () =>
            {
                await handler.NozomiSampleError(new NozomiSampleError.Req());
            }).Result;

            Assert.AreEqual(ex.message, "nozomi sample error");
            Assert.AreEqual(ex.status, 401);
            Assert.AreEqual(ex.code, 123);
        }
    }
}
