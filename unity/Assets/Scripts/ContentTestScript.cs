using Nozomi;
using Nozomi.Dev;

using UnityEngine;
using System.Net.Http;
using System.Net.Http.Headers;
using Fiveminlab.Newtonsoft.Json;

public class ContentTestScript : MonoBehaviour
{
    public enum SerializerType
    {
        Json,
        MessagePack
    }


    public readonly string BaseAddress = "http://127.0.0.1:12396";
    public readonly string AuthToken = "1234567890ABCDEF";

    public SerializerType RequestSerializer;
    public SerializerType ResponseSerializer;


    SampleRequestHandler handler;

    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }

    public SampleRequestHandler MakeHandler()
    {
        IContentSerializer requestSerializer;
        IContentSerializer responseSerializer;

        if (RequestSerializer == SerializerType.Json)
        {
            requestSerializer = new JsonContentSerializer();
        }
        else
        {
            requestSerializer = new MessagePackContentSerializer();
        }

        if (ResponseSerializer == SerializerType.Json)
        {
            responseSerializer = new JsonContentSerializer();
        }
        else
        {
            responseSerializer = new MessagePackContentSerializer();
        }

        var client = new HttpClient();
        client.DefaultRequestHeaders.Add("User-Agent", "TestAgent");

        var nozomi = new NozomiClient(client, BaseAddress, requestSerializer, responseSerializer);
        if (AuthToken != null)
        {
            nozomi.client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AuthToken);
        }
        var requestHandler = new SampleRequestHandler(nozomi);
        return requestHandler;
    }
    async public void SimpleGet()
    {
        var nozomi = MakeHandler();
        var result = await nozomi.NozomiSimpleGet(new NozomiSimpleGet.Req
        {
            n = 13243546,
            s = "String",
            b = true,
        });

        var json = JsonConvert.SerializeObject(result);
        Debug.Log(json);
    }
    async public void SimplePost()
    {
        var nozomi = MakeHandler();
        var result = await nozomi.NozomiSimplePost(new NozomiSimplePost.Req
        {
            n = 13243546,
            s = "String",
            b = true,
        });

        var json = JsonConvert.SerializeObject(result);
        Debug.Log(json);
    }
    async public void SimpleDelete()
    {
        var nozomi = MakeHandler();
        var result = await nozomi.NozomiSimpleDelete(new NozomiSimpleDelete.Req
        {
            n = 13243546,
            s = "String",
            b = true,
        });

        var json = JsonConvert.SerializeObject(result);
        Debug.Log(json);
    }
    async public void SimplePut()
    {
        var nozomi = MakeHandler();
        var result = await nozomi.NozomiSimplePut(new NozomiSimplePut.Req
        {
            n = 13243546,
            s = "String",
            b = true,
        });

        var json = JsonConvert.SerializeObject(result);
        Debug.Log(json);
    }
    async public void SampleError()
    {
        var nozomi = MakeHandler();
        var result = await nozomi.NozomiSampleError(new NozomiSampleError.Req());

        var json = JsonConvert.SerializeObject(result);
        Debug.Log(json);
    }
}
