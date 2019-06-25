# Nozomi

[![Build Status](https://travis-ci.org/5minlab/nozomi.svg?branch=master)](https://travis-ci.org/5minlab/nozomi)

Nozomi는 Express + Typescript 서버 API 코드를 기반으로 API 바인딩 코드를 생성해주는 코드 제너레이터입니다.

## 목적

다음과 같은 용도로 사용할 수 있습니다
 - 서버 코드를 보지 않고도 클라이언트에서 API Call
 - API 명세가 바뀌면 DLL 교체만으로 바로 대응이 가능
 - API 바인딩 코드를 작성하는 시간을 아낄 수 있음

## 리소스

 - [server](https://github.com/5minlab/nozomi/tree/master/server) 폴더는 Express 서버에서 어떻게 Nozomi를 사용하는지를 보여줍니다
 - Unity에서 API 바인딩을 사용하는 예시는 [unity](https://github.com/5minlab/nozomi/tree/master/unity) 폴더를 참조하세요

## 서버

Typescript Compiler API를 사용해 코드를 분석하며 JSDoc 태그에 따라 특정 명령을 수행합니다

`@nozomi`: Request/Response 구조체 및 API 바인딩 코드를 생성합니다
`@nozomi-handler`: MQTT, WS 등에서 사용할 수 있는 핸들러 및 디스패처를 생성합니다

### 바인딩 코드 생성

```typescript
/**
 * @nozomi NozomiSimpleGet
 * @swagger
 * /simple:
 *   get:
 *     summary: simple get
 *     tags: [nozomi]
 */
const lazy_get = handle(opened.simple_get.bind(opened), undefined);
```

주석에 `@nozomi` JSDoc 태그가 존재하면 `swagger` 태그를 참조해 메소드, 라우터 정보를 가져옵니다. 다소 제약이 존재하며 `Request` 구조체는 반드시 `MyRequest<T>` 꼴이어야 하며 리턴 타입은 `Promise<R>` 이어야 코드 분석 및 제너레이트가 됩니다

Nozomi가 참조하는 `@swagger` 필드는 리퀘스트 주소인 `path`와 HTTP 요청 메소드인 `path item` (get, put 등)입니다.

* 참고: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#paths-object

* `nozomi`: 클라이언트 바인딩 함수 이름
* `path`: 리퀘스트 주소
* `path item`: HTTP 요청 메소드

### 핸들러 코드 생성

```typescript
/**
 * @nozomi_handler NoticeMessage
 * @nozomi_channel notice
 */
interface NoticeMessage {
	notice: string;
	important: number;
	sticky: boolean;
	aaa: AAA;
}
```

interface 앞에 `@nozomi_handler` JSDoc 태그를 달면 MQTT 및 WS에서 사용할 수 있는 핸들러 및 디스패쳐 코드가 생성됩니다.

* `nozomi_handler`: 핸들러 이름이 지정된 명칭으로 정해집니다
* `nozomi_channel`: 핸들러가 속해있는 카테고리 또는 채널입니다

### 코드 생성

Nozomi 코드 생성시 DLL이 빌드됩니다. 빌드된 파일들은 `output` 폴더에 저장됩니다

```bash
cd server
npm install
./nozomi-dev.sh
```

### 서버 실행

API 테스트를 위해 서버를 실행합니다

```bash
npm run start
```

## 클라이언트

먼저 BaseRequestHandler를 상속받는 Custom Request Handler를 만듭니다

```c#
public class DevRequestHandler : Nozomi.Dev.BaseRequestHandler
{
		NozomiClient nozomi;
		public DevRequestHandler(NozomiClient nozomi)
		{
				this.nozomi = nozomi;
		}

		protected override async Task<TResp> Handle<TReq, TResp>(string method, string path, TReq req)
		{
				using (var message = new HttpRequestMessage(new HttpMethod(method), $"{nozomi.baseAddress}{path}"))
				using (var httpReq = new SimpleRequest(nozomi.client, message, nozomi.requestSerializer, nozomi.responseSerializer))
				{
						return await httpReq.Request<TReq, TResp>(req);
				}
		}
}
```

Handler를 만드는 헬퍼 함수인 makeHandler를 만듭니다.

```c#
public DevRequestHandler makeHandler(IContentSerializer requestSerializer, IContentSerializer responseSerializer, string AuthToken = null)
{
		var client = new HttpClient();
		client.DefaultRequestHeaders.Add("User-Agent", "TestAgent");

		var nozomi = new NozomiClient(client, BaseAddress, requestSerializer, responseSerializer);
		if (AuthToken != null)
		{
				nozomi.client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AuthToken);
		}
		var requestHandler = new DevRequestHandler(nozomi);
		return requestHandler;
}
```

Request Handler 인스턴스를 만들고 요청을 보냅니다. Request는 `NozomiSimpleGet.Req` 클래스를, Response는 `NozomiSimpleGet.Resp` 클래스를 사용합니다.

```c#
public async Task SimpleGet(DevRequestHandler handler)
{
		var handler = makeHandler(
				JsonContentSerializer.Default,
				JsonContentSerializer.Default
		);
		var result = await handler.NozomiSimpleGet(new NozomiSimpleGet.Req
		{
				n = 13243546,
				s = "String",
				b = true,
		});
}
```

### 테스트

`JsonContentTestScene` 씬을 열어 API를 테스트할 수 있습니다.

## 호환

다음 환경에서 테스트 되었습니다

- Typescript 3.4.5
- Unity 2018.3.0f2
- .NET Standard 2.0

AOT 플랫폼에서의 Serialization을 위해 커스텀된 JSON.NET이 사용됩니다

- Fiveminlab.Newtonsoft.Json

## 알려진 이슈

### Union Type 지원 안됨

- 현재 Nozomi에서 Union Type은 지원하고 있지 않습니다
  - `type res: string | number`

### 명시적 Non-Primitive Type 지원 안됨

- Non-Primitive Type이란 타입으로 object를 선언한 객체입니다.
  - `const obj: object = { };`

### MessagePack 지원

현재 MessagePack 지원은 Experimental 기능입니다.

- JsonContentSerializer 대신 MessagePackContentSerializer를 사용합니다
- Assembly Definition으로 MessagePack 폴더를 추가해야 합니다
- .NET Standard 2.0은 동적 코드 생성을 할 수 없으므로 MCP(MessagePack Universal Code Generator)를 사용해 코드를 제너레이트해야 합니다. 이 때 타겟 프로젝트는 유니티 프로젝트 파일이 아닌 `node_modules/nozomi/csproject/Nozomi/Nozomi.csproj`로 지정해야 합니다

### Enum 지원

현재 Enum 지원은 Experimental 기능입니다.

## 라이센스
TBD
