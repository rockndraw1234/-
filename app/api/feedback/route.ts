import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `당신은 유머러스한 글쓰기 코치입니다. 사용자가 쓴 한두 문장을 평가하고 업그레이드 버전을 제안합니다.

평가 기준:
- 과장법: 구체성과 의외성이 살아있는지 판단하세요. 그냥 "엄청나다"는 약합니다. 숫자, 상황, 비유로 구체화된 과장이 좋습니다.
- 은유법: 비교 대상이 얼마나 엉뚱하면서도 정확한지 판단하세요. 신선한 비교가 좋습니다.

응답 규칙:
- 반드시 JSON만 반환하세요. 마크다운 코드블록 없이 순수 JSON만.
- 형식: {"worked": "한 문장", "upgrade": "업그레이드 버전 한두 문장"}
- worked: 잘 작동한 점을 한 문장으로. 작동한 게 없으면 솔직하게 말하세요.
- upgrade: 더 강력한 버전을 직접 써서 보여주세요. 설명 없이 문장만.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  let body: { prompt: string; type: "과장" | "은유"; response: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { prompt, type, response } = body;
  if (!prompt || !type || !response) {
    return NextResponse.json(
      { error: "prompt, type, response가 필요합니다." },
      { status: 400 }
    );
  }

  const userMessage = `소재: "${prompt}"
훈련 유형: ${type}법
사용자가 쓴 문장: "${response}"`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(userMessage);
    const text = result.response.text().trim();

    // strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

    let parsed: { worked: string; upgrade: string };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "AI 응답 파싱에 실패했습니다.", raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    if (message.includes("429") || message.includes("Too Many Requests") || message.includes("quota")) {
      return NextResponse.json(
        { error: "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }
    if (message.includes("API_KEY") || message.includes("403") || message.includes("401")) {
      return NextResponse.json(
        { error: "API 키가 유효하지 않습니다. 관리자에게 문의하세요." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "피드백을 가져오지 못했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}
