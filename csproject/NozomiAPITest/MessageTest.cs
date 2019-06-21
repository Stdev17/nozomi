using Nozomi.Dev;
using Nozomi.Dev.Stream;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Fiveminlab.Newtonsoft.Json;
using System.Collections.Generic;

namespace NozomiTest
{
    class NoticeDispatcher : BaseNoticeDispatcher
    {
        public static NoticeMessage.Base noticeMsg = null;
        public override void OnNoticeMessageEvent(NoticeMessage.Base message)
        {
            noticeMsg = message;
        }
    }

    class ChatDispatcher : BaseChatDispatcher
    {
        public static PublicChatMessage.Base publicChatMsg = null;
        public static WhisperMessage.Base whisperMsg = null;

        public override void OnPublicChatMessageEvent(PublicChatMessage.Base message)
        {
            publicChatMsg = message;
        }

        public override void OnWhisperMessageEvent(WhisperMessage.Base message)
        {
            whisperMsg = message;
        }
    }

    [TestClass]
    public class MessageTest
    {
        /*
         * Fiveminlab.Newtonsoft.Json (Json.NET for Unity) 사용시
         * Custom Type JsonConverter가 작동하면서 UnityEngine.dll을 찾다가 터진다
         * 디폴트 Converter를 비워주면 터지지 않고 잘 작동함
         * MessageTest에만 해당사항이 있는데, JSON의 필드에 따라 가변적으로 동작하는 듯하다
         */
        [TestInitialize]
        public void Init()
        {
            JsonConvert.DefaultSettings = () => new JsonSerializerSettings
            {
                Converters = new List<JsonConverter> { }
            };
        }

        public static void Handle(string channel, string text)
        {
            if (text.IndexOf('|') != -1)
            {
                var type = text.Split("|")[0];
                var context = text.Substring(type.Length + 1);

                if (channel == "notice")
                {
                    NoticeDispatcher dispatcher = new NoticeDispatcher();
                    dispatcher.Dispatch(type, context);
                }

                if (channel == "chat")
                {
                    ChatDispatcher dispatcher = new ChatDispatcher();
                    dispatcher.Dispatch(type, context);
                }
            }
        }

        [TestMethod]
        public void NoticeMessageTest()
        {
            var text = @"NoticeMessage|{'notice': 'notice message', 'important': 2, 'sticky': false}";
            Handle("notice", text);

            Assert.AreEqual("notice message", NoticeDispatcher.noticeMsg.notice);
            Assert.AreEqual(2, NoticeDispatcher.noticeMsg.important);
            Assert.AreEqual(false, NoticeDispatcher.noticeMsg.sticky);
        }

        [TestMethod]
        public void PublicChatMessageTest()
        {
            var text = @"PublicChatMessage|{""author"": ""Sokcuri"", ""message"": ""hello world""}";
            Handle("chat", text);

            Assert.AreEqual("Sokcuri", ChatDispatcher.publicChatMsg.author);
            Assert.AreEqual("hello world", ChatDispatcher.publicChatMsg.message);
        }

        [TestMethod]
        public void WhisperMessageTest()
        {
            var text = @"WhisperMessage|{'sender': 'protoss', 'receiver': 'nexus', 'message': 'show me the money'}";
            Handle("chat", text);

            Assert.AreEqual("protoss", ChatDispatcher.whisperMsg.sender);
            Assert.AreEqual("nexus", ChatDispatcher.whisperMsg.receiver);
            Assert.AreEqual("show me the money", ChatDispatcher.whisperMsg.message);
        }
    }
}
