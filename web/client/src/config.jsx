export const options = {
  method: "POST",
  headers: {
    "xi-api-key": "c8255d3ecc78416b0c33c954971b483a",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "textInput",
    voice_settings: {
      similarity_boost: 0.75,
      stability: 0.62,
    },
    model_id: "eleven_multilingual_v1", //"eleven_turbo_v2"
  }),
};
export const audioSpeed = 3;
