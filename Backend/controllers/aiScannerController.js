const OpenAI = require("openai");

const analyzeFoodImage = async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "OpenAI API key is not configured.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a food image.",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const base64Image = req.file.buffer.toString("base64");

    const imageDataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    console.log("AI Scanner: sending image to OpenAI...");

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",

      input: [
        {
          role: "user",

          content: [
            {
              type: "input_text",

              text: `
You are NutriFlow's AI Food Scanner.

Analyze the food shown in this image.

Identify the meal and estimate its nutrition.

Important:
- Estimate the nutrition for the entire visible serving.
- If multiple foods are visible, treat them as one combined meal.
- Use reasonable nutrition estimates.
- Do not pretend the values are exact.
- estimatedServingGrams is the estimated weight of the visible food.
- protein, carbs, fat, and fiber are grams.
- confidence is a percentage from 0 to 100.
              `,
            },

            {
              type: "input_image",
              image_url: imageDataUrl,
              detail: "auto",
            },
          ],
        },
      ],

      text: {
        format: {
          type: "json_schema",

          name: "food_nutrition_result",

          strict: true,

          schema: {
            type: "object",

            properties: {
              foodName: {
                type: "string",
              },

              description: {
                type: "string",
              },

              estimatedServingGrams: {
                type: "number",
              },

              calories: {
                type: "number",
              },

              protein: {
                type: "number",
              },

              carbs: {
                type: "number",
              },

              fat: {
                type: "number",
              },

              fiber: {
                type: "number",
              },

              confidence: {
                type: "number",
              },
            },

            required: [
              "foodName",
              "description",
              "estimatedServingGrams",
              "calories",
              "protein",
              "carbs",
              "fat",
              "fiber",
              "confidence",
            ],

            additionalProperties: false,
          },
        },
      },
    });

    console.log("AI Scanner: OpenAI response received.");

    const output = response.output_text;

    console.log("AI Scanner output:", output);

    if (!output) {
      return res.status(502).json({
        success: false,
        message: "The AI did not return a result.",
      });
    }

    let result;

    try {
      result = JSON.parse(output);
    } catch (parseError) {
      console.error("AI returned invalid JSON:", output);

      return res.status(502).json({
        success: false,
        message: "AI returned an invalid nutrition result.",
      });
    }

    return res.status(200).json({
      success: true,
      result,
    });

  } catch (error) {
    console.error("AI Food Scanner Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Something went wrong while analyzing the food image.",
    });
  }
};

module.exports = {
  analyzeFoodImage,
};