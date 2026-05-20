// openai.js — serwis do GPT-4o streaming
//
// Kluczowa różnica vs. C# HttpClient streaming:
// Tutaj używamy oficjalnego OpenAI SDK który opakowuje stream w async iterator.
// Zamiast czytać bajty z Stream, iterujemy po "chunks" — każdy chunk to kawałek tekstu.
//
// SSE (Server-Sent Events) to protokół HTTP gdzie serwer push-uje dane do klienta
// bez zamykania połączenia. Frontend czyta eventy przez EventSource API.

import OpenAI from "openai";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts/claim.js";

// Inicjalizacja klienta — czyta OPENAI_API_KEY z process.env automatycznie
// (tak samo jak w C#: new HttpClient() + Authorization header)
const openai = new OpenAI();

/**
 * Streamuje analizę szkody przez GPT-4o.
 * Zapisuje chunki tekstu do response przez SSE.
 *
 * @param {string} claimDescription - opis zdarzenia
 * @param {string} yoloSummary      - wyniki detekcji z Roboflow
 * @param {object} res              - Express Response object do pisania SSE
 */
export async function streamClaimAnalysis(claimDescription, yoloSummary, res) {
  const userPrompt = buildUserPrompt(claimDescription, yoloSummary);

  // Ustawiamy nagłówki SSE — to musi być przed pierwszym res.write()
  // Content-Type: text/event-stream to standard SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // stream: true → SDK zwraca async iterator zamiast pojedynczej odpowiedzi
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      stream: true,
      // response_format zapewnia że model zwróci poprawny JSON
      response_format: { type: "json_object" },
      temperature: 0.3, // niższa temperatura = bardziej deterministyczne, mniej "kreatywne" wyniki
    });

    // Iterujemy po chunkach — każdy to kawałek wygenerowanego tekstu
    // To jest odpowiednik while(stream.CanRead) { var chunk = stream.Read() } w C#
    for await (const chunk of stream) {
      // chunk.choices[0].delta.content to nowy fragment tekstu (lub null na końcu)
      const text = chunk.choices[0]?.delta?.content || "";

      if (text) {
        // Format SSE: "data: <payload>\n\n"
        // Frontend EventSource automatycznie parsuje ten format
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    // Wysyłamy specjalny event [DONE] żeby frontend wiedział że streaming się skończył
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (error) {
    // Wysyłamy błąd przez SSE zamiast HTTP status (połączenie już jest otwarte)
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  } finally {
    // Zamykamy połączenie SSE
    res.end();
  }
}
