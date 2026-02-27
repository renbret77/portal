import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "Falta configurar la llave de OpenAI (OPENAI_API_KEY) en .env.local" }, { status: 500 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let extractedText = "";

        if (file.type === "application/pdf") {
            try {
                const pdf = require("pdf-parse");
                const data = await pdf(buffer);
                extractedText = data.text;
            } catch (err) {
                console.error("Error al leer el PDF:", err);
                return NextResponse.json({ error: "No se pudo extraer texto del PDF." }, { status: 500 });
            }
        } else {
            // Si suben una imagen, podríamos usar Vision API en el futuro.
            return NextResponse.json({ error: "Por ahora, solo se soporta formato PDF." }, { status: 400 });
        }

        if (!extractedText || extractedText.trim() === "") {
            return NextResponse.json({ error: "El PDF parece ser una imagen escaneada sin texto seleccionable." }, { status: 400 });
        }

        // Limpiar el texto un poco para no gastar tantos tokens
        extractedText = extractedText.replace(/\s+/g, ' ').substring(0, 15000); // Límite razonable

        const prompt = `
Eres un asistente experto en pólizas de seguros de México. Tu objetivo es extraer datos clave de la siguiente póliza y devolver EXCLUSIVAMENTE un objeto JSON válido, sin Markdown ni texto adicional.

Texto extraído de la póliza:
"""
${extractedText}
"""

Extrae y devuelve un JSON con la siguiente estructura exacta:
{
  "policy_number": "El número de la póliza",
  "insurer_name": "Nombre de la aseguradora (ej. Quálitas, GNP, AXA)",
  "start_date": "Fecha de inicio de vigencia en formato YYYY-MM-DD",
  "end_date": "Fecha de fin de vigencia en formato YYYY-MM-DD",
  "currency": "MXN o USD",
  "payment_method": "Contado, Semestral, Trimestral o Mensual",
  "premium_net": "Número decimal, prima neta sin impuestos ni derechos",
  "policy_fee": "Número decimal, gasto de expedición o derecho de póliza",
  "surcharge_amount": "Número decimal, recargo por pago fraccionado",
  "vat_amount": "Número decimal, IVA",
  "premium_total": "Número decimal, prima total a pagar"
}

Si no logras encontrar un dato, aségnale el valor null. Si los montos están, por ejemplo, como "$10,500.00", devuélvelo como un número (10500.00).
Asegúrate de responder SOLO el JSON.`;

        // Inicializar OpenAI dentro de la petición para evitar errores durante build
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You extract structured JSON from raw text." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0,
        });

        const resultText = completion.choices[0].message.content || "{}";
        const resultObj = JSON.parse(resultText);

        return NextResponse.json(resultObj);

    } catch (error: any) {
        console.error("Error en AI Parse:", error);
        return NextResponse.json({ error: "Error interno procesando la póliza: " + error.message }, { status: 500 });
    }
}
