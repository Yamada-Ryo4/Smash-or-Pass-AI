import { systemPrompts } from './prompts.js';
import { getSettings } from './settings.js';

export async function analyzeImage(imageDataUrl, aiType, modelName) {
    const settings = getSettings(); 
    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: imageDataUrl,
                aiType: aiType, 
                systemPrompt: systemPrompts[aiType], 
                model: modelName,
                isPing: false,
                customApiKey: settings.customApiKey
            })
        });

        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.error || `Request Failed: ${response.status}`);
        
        if (!responseData.candidates || !responseData.candidates[0]?.content) {
             if (responseData.promptFeedback?.blockReason) throw new Error(`Safety Block: ${responseData.promptFeedback.blockReason}`);
             throw new Error('API returned invalid or empty response.');
        }

        let content = responseData.candidates[0].content.parts[0].text;
        
        // ★★★ Robust JSON Parsing (Compatible with Gemma) ★★★
        try {
            // 1. Try cleaning Markdown
            const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        } catch (e1) {
            // 2. If failed, try extracting content between the first { and last }
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
                throw new Error("Could not extract JSON from response");
            } catch (e2) {
                console.error("Raw Content:", content);
                throw new Error("AI returned unparsable content (JSON Error).");
            }
        }

    } catch (error) {
        console.error("API Call Failed:", error);
        throw error;
    }
}

export async function testServiceAvailability() {
    const settings = getSettings(); 
    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                isPing: true,
                customApiKey: settings.customApiKey
            })
        });

        const data = await response.json();
        if (!response.ok) return { success: false, message: data.error || "Service Error" };
        return { success: true, message: "Service Connected" };
    } catch (error) {
        return { success: false, message: error.message };
    }
}