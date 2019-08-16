using Microsoft.VisualStudio.TestTools.UnitTesting;
using Nozomi.Dev;

namespace NozomiTest
{
    [TestClass]
    public class StructTest
    {
        [TestMethod]
        public void TestStruct()
        {
            // 클래스 생성만 확인
            var x = new OnlyStruct()
            {
                s = "foo",
                n = 123,
                b = true,
                inner = new OnlyStruct.StructInner
                {
                    a = "bar",
                    b = 1,
                    c = true,
                },
            };
        }
    }
}
