using Nozomi.Dev;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Nozomi;

namespace NozomiTest
{
    [TestClass]
    public class TimeoutTest : BaseTest
    {
        DevRequestHandler handler => makeHandler(
            JsonContentSerializer.Default,
            JsonContentSerializer.Default
        );

        [TestMethod]
        public async Task TestUseCancellationToken()
        {
            var h = this.handler;

            var cts = new CancellationTokenSource();
            cts.CancelAfter(100);
            var ct = cts.Token;

            try
            {
                var result = await h.NozomiTimeout(new NozomiTimeout.Req { }, ct);
                Assert.Fail();
            }
            catch (TaskCanceledException)
            {
                // success
            }
        }
    }
}
